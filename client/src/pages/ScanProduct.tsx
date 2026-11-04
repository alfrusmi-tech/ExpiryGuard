import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeSupportedFormats, Html5QrcodeScannerState } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { useInventory } from '../hooks/useInventory';
import { inventoryService } from '../services/inventoryService';
import { Product } from '../types';
import { 
  ScanLine, 
  ArrowLeft, 
  Camera, 
  CameraOff, 
  RefreshCw, 
  Zap, 
  ZapOff, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Package, 
  ShieldCheck, 
  Sparkles, 
  Edit3, 
  Plus, 
  X,
  Save,
  Barcode
} from 'lucide-react';

interface ScannedFormState {
  name: string;
  categoryId: string;
  sku: string;
  barcode: string;
  batchNumber: string;
  quantity: string;
  manufacturingDate: string;
  expiryDate: string;
  unitPrice: string;
  supplier: string;
  reorderLevel: string;
}

export function ScanProduct() {
  const navigate = useNavigate();
  const { categories, products, addProduct } = useInventory();

  // Scanner states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isTorchSupported, setIsTorchSupported] = useState(false);
  const [scanStatus, setScanStatus] = useState<string>('Ready to start camera');

  // Scanned / detected state
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [matchType, setMatchType] = useState<'existing' | 'catalog' | 'unknown' | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Form state for reviewing/adding product
  const [formData, setFormData] = useState<ScannedFormState>({
    name: '',
    categoryId: '',
    sku: '',
    barcode: '',
    batchNumber: '',
    quantity: '50',
    manufacturingDate: '',
    expiryDate: '',
    unitPrice: '',
    supplier: '',
    reorderLevel: '15'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Refs
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerElementId = 'expiryguard-qr-reader';
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play audio confirmation beep on scan
  const playBeep = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          audioContextRef.current = new AudioCtx();
        }
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // 880 Hz high note
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch {
      // Audio autoplay policy may suppress; ignore safely
    }
  }, []);

  // Fetch available camera devices
  useEffect(() => {
    let isMounted = true;
    async function loadCameras() {
      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
          const devices = await Html5Qrcode.getCameras();
          if (isMounted && devices && devices.length > 0) {
            setAvailableCameras(devices);
            // Default to back camera if found
            const backCam = devices.find(d => 
              d.label.toLowerCase().includes('back') || 
              d.label.toLowerCase().includes('rear') ||
              d.label.toLowerCase().includes('environment')
            );
            setSelectedCameraId(backCam ? backCam.id : devices[0].id);
          }
        }
      } catch (err) {
        console.warn('Could not list cameras prior to permission request:', err);
      }
    }
    loadCameras();
    return () => {
      isMounted = false;
    };
  }, []);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(async () => {
    try {
      if (scannerRef.current) {
        const scanner = scannerRef.current;
        if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
          await scanner.stop();
        }
        scanner.clear();
      }
    } catch (err) {
      console.warn('Error stopping scanner:', err);
    } finally {
      setIsCameraActive(false);
      setIsTorchOn(false);
      setIsTorchSupported(false);
      setScanStatus('Camera stopped');
    }
  }, []);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
            scannerRef.current.stop().catch(() => {});
          }
          scannerRef.current.clear();
        } catch {
          // ignore cleanup errors
        }
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Process detected code
  const handleCodeDetected = useCallback(async (decodedText: string) => {
    if (!decodedText || !decodedText.trim()) return;
    const cleanCode = decodedText.trim();

    // Prevent immediate re-triggering of the same code
    playBeep();
    setLastScannedCode(cleanCode);
    setScanStatus(`Code detected: ${cleanCode}`);

    // Pause scanner while user handles dialog
    await stopCamera();

    // Check inventory and known catalog
    const existing = await inventoryService.findProductByCode(cleanCode);

    // Also check if this barcode is already in the loaded products
    const inLoaded = products.find(p => 
      p.barcode === cleanCode || 
      p.sku.toLowerCase() === cleanCode.toLowerCase()
    );

    if (inLoaded) {
      setDuplicateWarning(
        `Note: Item "${inLoaded.name}" with this code already exists in inventory (Batch: ${inLoaded.batchNumber}). Adding will register an additional stock lot.`
      );
    } else {
      setDuplicateWarning(null);
    }

    if (existing) {
      const isCustomExisting = products.some(p => p.id === existing.id);
      setMatchType(isCustomExisting ? 'existing' : 'catalog');
      setFormData({
        name: existing.name || '',
        categoryId: existing.categoryId || 'c3',
        sku: existing.sku || `SKU-${cleanCode.slice(-6)}`,
        barcode: cleanCode,
        batchNumber: existing.batchNumber || `LOT-${cleanCode.slice(-4)}`,
        quantity: String(existing.quantity || 50),
        manufacturingDate: existing.manufacturingDate || '',
        expiryDate: existing.expiryDate || '',
        unitPrice: existing.unitPrice !== undefined ? String(existing.unitPrice) : '10.00',
        supplier: existing.supplier || 'Standard Pharmaceutical Supplier',
        reorderLevel: String(existing.reorderLevel || 15)
      });
    } else {
      // Unknown code: pre-fill code and ask user for details
      setMatchType('unknown');
      setFormData({
        name: '',
        categoryId: 'c3', // Default to Medicine
        sku: `MED-${cleanCode.slice(-4).toUpperCase()}`,
        barcode: cleanCode,
        batchNumber: `B-${Date.now().toString().slice(-4)}`,
        quantity: '50',
        manufacturingDate: '',
        expiryDate: '',
        unitPrice: '',
        supplier: '',
        reorderLevel: '15'
      });
    }

    setShowReviewModal(true);
  }, [playBeep, stopCamera, products]);

  // Start Camera
  const startCamera = async () => {
    setIsInitializing(true);
    setCameraError(null);
    setScanStatus('Requesting camera permissions...');

    try {
      // Ensure any existing instance is cleaned up
      if (scannerRef.current) {
        try {
          if (scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
            await scannerRef.current.stop();
          }
          scannerRef.current.clear();
        } catch {
          // ignore
        }
      }

      const html5QrCode = new Html5Qrcode(scannerElementId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.ITF,
        ],
        verbose: false,
      });

      scannerRef.current = html5QrCode;

      // Determine camera config: preferred camera ID or facing mode
      const cameraConfig = selectedCameraId
        ? { deviceId: { exact: selectedCameraId } }
        : { facingMode: facingMode };

      await html5QrCode.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minDim = Math.min(viewfinderWidth, viewfinderHeight);
            return {
              width: Math.floor(minDim * 0.75),
              height: Math.floor(minDim * 0.75),
            };
          },
          aspectRatio: 1.333333,
        },
        (decodedText) => {
          handleCodeDetected(decodedText);
        },
        () => {
          // Normal frame scan tick without a code; ignore to prevent console spam
        }
      );

      setIsCameraActive(true);
      setScanStatus('Camera active • Align barcode inside the frame');

      // Check flashlight/torch capability
      try {
        const capabilities = html5QrCode.getRunningTrackCameraCapabilities();
        if (capabilities && capabilities.torchFeature().isSupported()) {
          setIsTorchSupported(true);
        } else {
          setIsTorchSupported(false);
        }
      } catch {
        setIsTorchSupported(false);
      }

      // Refresh camera devices list with permission granted labels
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setAvailableCameras(devices);
        }
      } catch {
        // ignore
      }

    } catch (err: unknown) {
      console.error('Failed to start camera scanner:', err);
      let message = 'Unable to access camera device.';
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.message.includes('Permission denied')) {
          message = 'Camera permission was denied. Please allow camera access in your browser settings to scan medicine barcodes, or use manual entry below.';
        } else if (err.name === 'NotFoundError' || err.message.includes('Requested device not found')) {
          message = 'No camera device detected on this system. You can connect a webcam or use manual product entry.';
        } else if (err.name === 'NotReadableError') {
          message = 'Camera is currently in use by another application. Please close other camera tabs or applications.';
        } else {
          message = err.message || message;
        }
      }
      setCameraError(message);
      setIsCameraActive(false);
      setScanStatus('Camera error');
    } finally {
      setIsInitializing(false);
    }
  };

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!scannerRef.current || !isCameraActive || !isTorchSupported) return;
    try {
      const nextState = !isTorchOn;
      await scannerRef.current.getRunningTrackCameraCapabilities().torchFeature().apply(nextState);
      setIsTorchOn(nextState);
    } catch (err) {
      console.warn('Torch toggle not supported or failed:', err);
    }
  };

  // Switch Camera
  const switchCamera = async () => {
    if (!isCameraActive) return;
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    
    // If we have explicit camera devices, cycle to next
    if (availableCameras.length > 1) {
      const currentIndex = availableCameras.findIndex(c => c.id === selectedCameraId);
      const nextIndex = (currentIndex + 1) % availableCameras.length;
      setSelectedCameraId(availableCameras[nextIndex].id);
    }
    
    await stopCamera();
    setTimeout(() => {
      startCamera();
    }, 200);
  };

  // Validate review form
  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Medicine name is required';
    if (!formData.categoryId) errs.categoryId = 'Category is required';
    if (!formData.sku.trim()) errs.sku = 'SKU is required';
    if (!formData.batchNumber.trim()) errs.batchNumber = 'Batch lot number is required';
    if (!formData.quantity || isNaN(Number(formData.quantity)) || Number(formData.quantity) < 0) {
      errs.quantity = 'Valid quantity (>= 0) is required';
    }
    if (!formData.expiryDate) {
      errs.expiryDate = 'Expiry date is required';
    } else if (formData.manufacturingDate && new Date(formData.manufacturingDate) > new Date(formData.expiryDate)) {
      errs.manufacturingDate = 'Manufacturing date cannot be after expiry date';
    }

    if (formData.unitPrice && (isNaN(Number(formData.unitPrice)) || Number(formData.unitPrice) < 0)) {
      errs.unitPrice = 'Unit price must be a valid non-negative number';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Save product to inventory
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const newProduct: Omit<Product, 'id'> = {
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        sku: formData.sku.trim(),
        barcode: formData.barcode.trim(),
        batchNumber: formData.batchNumber.trim(),
        quantity: Number(formData.quantity),
        manufacturingDate: formData.manufacturingDate || undefined,
        expiryDate: formData.expiryDate,
        unitPrice: formData.unitPrice ? Number(formData.unitPrice) : undefined,
        supplier: formData.supplier.trim() || 'General Pharma Supplier',
        reorderLevel: Number(formData.reorderLevel) || 15
      };

      await addProduct(newProduct);
      setSaveSuccessMessage(`"${newProduct.name}" was successfully registered into the frontend inventory!`);
      setShowReviewModal(false);
    } catch (err) {
      console.error('Error saving scanned product:', err);
      setFormErrors({ form: 'An unexpected error occurred while saving the product.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Quick demo barcode simulator for testing without physical camera cards
  const simulateScan = (barcode: string) => {
    handleCodeDetected(barcode);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link to="/inventory">
            <Button variant="ghost" size="sm" className="px-2.5 text-slate-600 hover:text-emerald-700">
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ScanLine className="w-6 h-6 text-emerald-600" />
              Scan Medicine Packaging
            </h1>
            <p className="text-slate-500 text-sm">
              Scan QR codes, 2D DataMatrix, or standard product barcodes to verify and register medicines in the frontend inventory.
            </p>
          </div>
        </div>

        <Link to="/add-product">
          <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
            <Edit3 className="w-4 h-4 mr-2" />
            Manual Product Entry
          </Button>
        </Link>
      </div>

      {/* Success Notification Banner */}
      {saveSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-950">Product Added to Frontend Inventory</p>
              <p className="text-xs text-emerald-700 mt-0.5">{saveSuccessMessage} (Live in current session)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setSaveSuccessMessage(null)}
              className="text-xs"
            >
              Dismiss
            </Button>
            <Button 
              size="sm" 
              onClick={() => navigate('/inventory')}
              className="text-xs"
            >
              View in Inventory
            </Button>
          </div>
        </div>
      )}

      {/* Camera Error Alert */}
      {cameraError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-950">Camera Access Error</p>
            <p className="text-xs text-red-700 mt-0.5 leading-relaxed">{cameraError}</p>
            <div className="mt-3 flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={startCamera} className="text-xs bg-white text-red-700 border-red-200 hover:bg-red-50">
                Retry Camera
              </Button>
              <Link to="/add-product">
                <Button size="sm" className="text-xs bg-red-600 hover:bg-red-700 text-white">
                  Use Manual Entry
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Camera Preview & Viewfinder */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            {/* Camera Control Bar Top */}
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isCameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  {isCameraActive ? 'Camera Live' : 'Camera Standby'}
                </span>
              </div>

              {/* Status text */}
              <span className="text-xs text-emerald-400 truncate max-w-[200px] sm:max-w-xs font-mono">
                {scanStatus}
              </span>
            </div>

            {/* Viewport Area */}
            <div className="relative bg-slate-950 min-h-[380px] sm:min-h-[440px] flex flex-col items-center justify-center p-4">
              
              {/* Actual HTML5 QR Code Container (video element renders here) */}
              <div 
                id={scannerElementId} 
                className={`w-full max-w-md overflow-hidden rounded-2xl ${isCameraActive ? 'block' : 'hidden'}`}
              />

              {/* Standby Viewfinder Placeholder */}
              {!isCameraActive && (
                <div className="relative w-full max-w-sm aspect-square sm:aspect-[4/3] rounded-2xl border-2 border-dashed border-emerald-500/30 bg-emerald-950/20 p-6 flex flex-col items-center justify-center overflow-hidden text-center">
                  
                  {/* Corner brackets */}
                  <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg"></div>
                  <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg"></div>
                  <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg"></div>
                  <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br-lg"></div>

                  <div className="p-4 rounded-2xl bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 mb-3 shadow-inner">
                    <Barcode className="w-10 h-10" />
                  </div>

                  <h3 className="text-sm font-semibold text-emerald-300 uppercase tracking-wider">
                    Optical Medicine Scanner
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-[240px] leading-relaxed">
                    Point your camera at medicine packaging, pharmaceutical QR labels, or GS1 DataMatrix codes.
                  </p>

                  <div className="mt-5">
                    <Button 
                      onClick={startCamera} 
                      disabled={isInitializing}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg text-sm font-semibold px-6"
                    >
                      {isInitializing ? (
                        <span className="flex items-center">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                          Opening Camera...
                        </span>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 mr-2" />
                          Start Camera Scanner
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Camera Active Controls Bar */}
              {isCameraActive && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 z-10">
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={stopCamera}
                    className="shadow-md text-xs font-semibold"
                  >
                    <CameraOff className="w-4 h-4 mr-1.5" />
                    Stop Camera
                  </Button>

                  {availableCameras.length > 1 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={switchCamera}
                      className="bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800 text-xs font-semibold"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                      Switch Camera
                    </Button>
                  )}

                  {isTorchSupported && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={toggleTorch}
                      className={`text-xs font-semibold border-slate-700 ${
                        isTorchOn 
                          ? 'bg-amber-400 text-slate-900 border-amber-400 hover:bg-amber-300' 
                          : 'bg-slate-900 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {isTorchOn ? <ZapOff className="w-3.5 h-3.5 mr-1.5" /> : <Zap className="w-3.5 h-3.5 mr-1.5" />}
                      Flashlight {isTorchOn ? 'ON' : 'OFF'}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Formats Supported Footer */}
            <div className="bg-slate-900/95 border-t border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Supported Formats:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['QR Code', 'DataMatrix', 'EAN-13', 'EAN-8', 'UPC-A', 'Code-128', 'Code-39'].map(f => (
                  <span key={f} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Quick Demo Barcode Simulator */}
          <Card className="border-slate-200/80 bg-emerald-50/30">
            <CardContent className="p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Demo Barcode Simulator (Click to Test)
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">Test barcode detection instantly</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => simulateScan('8901030012345')}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-200 text-xs font-medium text-emerald-900 hover:bg-emerald-50 hover:border-emerald-300 transition-colors shadow-2xs"
                >
                  💊 Paracetamol 500mg (8901030012345)
                </button>
                <button
                  type="button"
                  onClick={() => simulateScan('8901030099881')}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-200 text-xs font-medium text-emerald-900 hover:bg-emerald-50 hover:border-emerald-300 transition-colors shadow-2xs"
                >
                  🧪 Amoxicillin 500mg (8901030099881)
                </button>
                <button
                  type="button"
                  onClick={() => simulateScan('8901030077665')}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-200 text-xs font-medium text-emerald-900 hover:bg-emerald-50 hover:border-emerald-300 transition-colors shadow-2xs"
                >
                  📦 Ibuprofen 400mg (8901030077665)
                </button>
                <button
                  type="button"
                  onClick={() => simulateScan('8901030054321')}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-200 text-xs font-medium text-emerald-900 hover:bg-emerald-50 hover:border-emerald-300 transition-colors shadow-2xs"
                >
                  🧴 Cough Syrup (8901030054321)
                </button>
                <button
                  type="button"
                  onClick={() => simulateScan(`UNKNOWN-${Date.now().toString().slice(-6)}`)}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  🏷️ New Unknown Barcode
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Guidelines & Workflow */}
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Scanning Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Ensure Adequate Lighting</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Position the medicine packaging in good light or toggle the scanner flashlight.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Hold 4–8 Inches Away</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Center the barcode within the green frame. Avoid harsh reflections on glossy foil packs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Verify Expiry & Batch</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review extracted dates and batch details before confirming entry into the inventory.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-slate-50/50">
            <CardContent className="p-5 flex items-start gap-3">
              <Package className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-900">No scanner available?</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  You can register medicines without a camera using the manual entry form anytime.
                </p>
                <Link to="/add-product" className="inline-block mt-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline">
                  Go to Manual Form &rarr;
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scanned Review / Add to Inventory Dialog Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div 
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                  <ScanLine className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {matchType === 'existing' || matchType === 'catalog' 
                      ? 'Scanned Medicine Detected' 
                      : 'New Barcode Scanned — Enter Details'}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                      {lastScannedCode}
                    </span>
                    <Badge variant={matchType === 'existing' ? 'info' : matchType === 'catalog' ? 'success' : 'default'}>
                      {matchType === 'existing' ? 'Inventory Match' : matchType === 'catalog' ? 'Pharma Database Match' : 'Unregistered Code'}
                    </Badge>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveProduct}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {duplicateWarning && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{duplicateWarning}</span>
                  </div>
                )}

                <p className="text-xs text-slate-500">
                  Review the details extracted from the code and adjust values as needed before adding to current frontend inventory.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Input 
                      label="Medicine / Product Name *"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Paracetamol 500mg"
                      error={formErrors.name}
                    />
                  </div>

                  <Select 
                    label="Category *"
                    value={formData.categoryId}
                    onChange={e => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    error={formErrors.categoryId}
                    options={categories.map(c => ({ value: c.id, label: c.name }))}
                  />

                  <Input 
                    label="Barcode / QR Code *"
                    value={formData.barcode}
                    onChange={e => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                    error={formErrors.barcode}
                  />

                  <Input 
                    label="SKU / Item Code *"
                    value={formData.sku}
                    onChange={e => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="e.g. MED-001"
                    error={formErrors.sku}
                  />

                  <Input 
                    label="Batch / Lot Number *"
                    value={formData.batchNumber}
                    onChange={e => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
                    placeholder="e.g. M-5001"
                    error={formErrors.batchNumber}
                  />

                  <Input 
                    label="Quantity to Add *"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={e => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    error={formErrors.quantity}
                  />

                  <Input 
                    label="Unit Price ($)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unitPrice}
                    onChange={e => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                    placeholder="e.g. 12.50"
                    error={formErrors.unitPrice}
                  />

                  <Input 
                    label="Manufacturing Date"
                    type="date"
                    value={formData.manufacturingDate}
                    onChange={e => setFormData(prev => ({ ...prev, manufacturingDate: e.target.value }))}
                    error={formErrors.manufacturingDate}
                  />

                  <Input 
                    label="Expiry Date *"
                    type="date"
                    value={formData.expiryDate}
                    onChange={e => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    error={formErrors.expiryDate}
                  />

                  <Input 
                    label="Supplier / Manufacturer"
                    value={formData.supplier}
                    onChange={e => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                    placeholder="e.g. PharmaLife Laboratories"
                  />

                  <Input 
                    label="Reorder Threshold"
                    type="number"
                    min="0"
                    value={formData.reorderLevel}
                    onChange={e => setFormData(prev => ({ ...prev, reorderLevel: e.target.value }))}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </Button>

                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => {
                      setShowReviewModal(false);
                      startCamera();
                    }}
                    className="text-xs text-slate-600"
                  >
                    Rescan
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSaving}
                    className="shadow-sm font-semibold flex items-center gap-2"
                  >
                    {isSaving ? (
                      <span className="flex items-center">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                        Saving...
                      </span>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add to Frontend Inventory
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
