     import { useCallback, useEffect, useRef, useState } from 'react';
     import type { FormEvent } from 'react';
     import { Link, useNavigate } from 'react-router-dom';
     import { Html5Qrcode, Html5QrcodeScannerState, Html5QrcodeSupportedFormats} from 'html5-qrcode';
     import { AlertCircle, AlertTriangle, ArrowLeft, Barcode,Camera, CameraOff, CheckCircle2,RefreshCw,
       ScanLine,ShieldCheck,Zap,ZapOff,X} from 'lucide-react';
     import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
     import { Button } from '../components/common/Button';
     import { Input } from '../components/common/Input';
     import { Select } from '../components/common/Select';
     import { Badge } from '../components/common/Badge';
     import { useInventory } from '../hooks/useInventory';
     import { barcodeService } from '../services/barcodeService';
     import type { ProductCreateInput } from '../types';

     type FormField = | 'name' | 'categoryId'| 'sku'| 'barcode'| 'batchNumber'| 'quantity'
       | 'manufacturingDate' | 'expiryDate' | 'unitPrice' | 'supplier' | 'reorderLevel';
     type ScanForm = Record<FormField, string>;
     type MatchType = 'existing' | 'unknown' | null;

     const EMPTY_FORM: ScanForm = {
       name: '', categoryId: '', sku: '', barcode: '', batchNumber: '', quantity: '',
       manufacturingDate: '',expiryDate: '', unitPrice: '', supplier: '',
       reorderLevel: ''
     };

     const SCANNER_ID = 'expiryguard-qr-reader';

     export function ScanProduct() {
       const navigate = useNavigate();
       const { categories, addProduct } = useInventory();

       const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
       const [cameraId, setCameraId] = useState('');
       const [cameraActive, setCameraActive] = useState(false);
       const [cameraStarting, setCameraStarting] = useState(false);
       const [cameraError, setCameraError] = useState<string | null>(null);
       const [torchSupported, setTorchSupported] = useState(false);
       const [torchOn, setTorchOn] = useState(false);
       const [scanStatus, setScanStatus] = useState('Camera ready');

       const [manualCode, setManualCode] = useState('');
       const [scannedCode, setScannedCode] = useState('');
       const [lookingUp, setLookingUp] = useState(false);
       const [matchType, setMatchType] = useState<MatchType>(null);
       const [reviewOpen, setReviewOpen] = useState(false);
       const [form, setForm] = useState<ScanForm>({ ...EMPTY_FORM });
       const [errors, setErrors] = useState<Record<string, string>>({});
       const [saving, setSaving] = useState(false);
       const [success, setSuccess] = useState<string | null>(null);

       const scannerRef = useRef<Html5Qrcode | null>(null);
       const scanBusyRef = useRef(false);
       const audioRef = useRef<AudioContext | null>(null);

       const updateForm = (field: FormField, value: string) => {
         setForm(current => ({ ...current, [field]: value }));
         setErrors(current => ({ ...current, [field]: '', form: '' }));
       };

       const playBeep = useCallback(() => {
         try {
           const context = audioRef.current ?? new AudioContext();
           audioRef.current = context;
           if (context.state === 'suspended') void context.resume();
           const oscillator = context.createOscillator();
           const gain = context.createGain();
           oscillator.frequency.value = 880;
           gain.gain.value = 0.08;
           oscillator.connect(gain);
           gain.connect(context.destination);
           oscillator.start();
           oscillator.stop(context.currentTime + 0.12);
         } catch {
           // Audio is optional; scanning must work even when muted.
         }
       }, []);

       useEffect(() => {
         let active = true;
         Html5Qrcode.getCameras()
           .then(devices => {
             if (!active) return;
             setCameras(devices);
             const rear = devices.find(device =>
               /back|rear|environment/i.test(device.label)
             );
             setCameraId(rear?.id ?? devices[0]?.id ?? '');
           })
           .catch(() => {
             // Camera enumeration can fail before permission is granted.
           });
         return () => { active = false; };
       }, []);

       const stopCamera = useCallback(async () => {
         const scanner = scannerRef.current;
         scannerRef.current = null;
         if (scanner) {
           try {
             const state = scanner.getState();
             if (
               state === Html5QrcodeScannerState.SCANNING ||
               state === Html5QrcodeScannerState.PAUSED
             ) {
               await scanner.stop();
             }
             scanner.clear();
           } catch (error) {
             console.warn('Could not completely stop scanner:', error);
           }
         }
         setCameraActive(false);
         setTorchSupported(false);
         setTorchOn(false);
       }, []);

       useEffect(() => {
         return () => {
           const scanner = scannerRef.current;
           scannerRef.current = null;
           if (scanner) {
             try {
               const state = scanner.getState();
               if (
                 state === Html5QrcodeScannerState.SCANNING ||
                 state === Html5QrcodeScannerState.PAUSED
               ) {
                 void scanner.stop().then(() => scanner.clear()).catch(() => {});
               } else {
                 scanner.clear();
               }
             } catch {
               // Component is unmounting.
             }
           }
           if (audioRef.current) void audioRef.current.close().catch(() => {});
         };
       }, []);

       const handleCodeDetected = useCallback(async (rawCode: string) => {
         const code = rawCode.trim();
         if (!code || scanBusyRef.current) return;

         scanBusyRef.current = true;
         setLookingUp(true);
         setCameraError(null);
         setErrors({});
         setSuccess(null);
         setScannedCode(code);
         setScanStatus(`Detected: ${code}`);
         playBeep();

         try {
           await stopCamera();
           // This service must use GET /api/products/lookup, not mock data.
           const found = await barcodeService.findByCode(code);

           if (found) {
             setMatchType('existing');
             setForm({
               name: found.name,
               categoryId: found.categoryId,
               sku: found.sku,
               barcode: found.barcode ?? '',
               batchNumber: '',
               quantity: '',
               manufacturingDate: '',
               expiryDate: '',
               unitPrice: '',
               supplier: '',
               reorderLevel: String(found.reorderLevel)
             });
             setScanStatus('Existing product found in PostgreSQL');
           } else {
             setMatchType('unknown');
             setForm({
               ...EMPTY_FORM,
               barcode: code
             });
             setScanStatus('New product: enter verified details');
           }
           setReviewOpen(true);
         } catch (error) {
           setCameraError(error instanceof Error
             ? error.message
             : 'Barcode lookup failed');
           setScanStatus('Lookup failed');
         } finally {
           setLookingUp(false);
           scanBusyRef.current = false;
         }
       }, [playBeep, stopCamera]);

       const startCamera = async () => {
         if (cameraStarting || lookingUp || reviewOpen) return;
         setCameraStarting(true);
         setCameraError(null);
         setScanStatus('Opening camera...');

         try {
           await stopCamera();
           // Keep the scanner DIV mounted even when the camera is stopped.
           const scanner = new Html5Qrcode(SCANNER_ID, {
             formatsToSupport: [
               Html5QrcodeSupportedFormats.QR_CODE,
               Html5QrcodeSupportedFormats.DATA_MATRIX,
               Html5QrcodeSupportedFormats.EAN_13,
               Html5QrcodeSupportedFormats.EAN_8,
               Html5QrcodeSupportedFormats.UPC_A,
               Html5QrcodeSupportedFormats.UPC_E,
               Html5QrcodeSupportedFormats.CODE_128,
               Html5QrcodeSupportedFormats.CODE_39
             ],
             verbose: false
           });
           scannerRef.current = scanner;

           const camera = cameraId
             ? { deviceId: { exact: cameraId } }
             : { facingMode: 'environment' };

           await scanner.start(
             camera,
             {
               fps: 12,
               qrbox: (width, height) => {
                 const size = Math.max(100, Math.floor(Math.min(width, height) * 0.7));
                 return { width: size, height: size };
               }
             },
             decoded => { void handleCodeDetected(decoded); },
             () => { /* No code in this frame. */ }
           );

           setCameraActive(true);
           setScanStatus('Point the camera at a barcode or SKU label');
           try {
             setTorchSupported(
               scanner.getRunningTrackCameraCapabilities()
                 .torchFeature().isSupported()
             );
           } catch {
             setTorchSupported(false);
           }
         } catch (error) {
           setCameraError(error instanceof Error
             ? error.message
             : 'Unable to open camera. Check browser permissions.');
           setScanStatus('Camera unavailable — manual lookup is available');
           await stopCamera();
         } finally {
           setCameraStarting(false);
         }
       };

       const toggleTorch = async () => {
         const scanner = scannerRef.current;
         if (!scanner || !torchSupported) return;
         try {
           await scanner.getRunningTrackCameraCapabilities()
             .torchFeature().apply(!torchOn);
           setTorchOn(current => !current);
         } catch {
           setCameraError('This camera could not toggle its flashlight.');
         }
       };

       const validate = (): boolean => {
         const next: Record<string, string> = {};
         if (!form.name.trim()) next.name = 'Medicine name is required';
         if (!Number.isSafeInteger(Number(form.categoryId)) ||
             Number(form.categoryId) <= 0) next.categoryId = 'Choose a database category';
         if (!form.sku.trim()) next.sku = 'SKU is required';
         if (form.barcode && form.barcode.length > 64) next.barcode = 'Maximum 64 characters';
         if (!form.batchNumber.trim()) next.batchNumber = 'Actual batch number is required';
         if (!/^[1-9]\d*$/.test(form.quantity) ||
             Number(form.quantity) > 2147483647) next.quantity = 'Enter a positive whole-number quantity';
         if (!/^\d{4}-\d{2}-\d{2}$/.test(form.expiryDate)) {
           next.expiryDate = 'Enter the expiry date shown on the package';
         }
         if (form.manufacturingDate &&
             form.manufacturingDate > form.expiryDate) {
           next.manufacturingDate = 'Manufacturing date must be before expiry';
         }
         if (!form.supplier.trim()) next.supplier = 'Supplier name is required';
         if (form.reorderLevel.trim() !== '' &&
             (!/^(0|[1-9]\d*)$/.test(form.reorderLevel) ||
              Number(form.reorderLevel) > 2147483647)) {
           next.reorderLevel = 'Enter a non-negative whole number';
         }
         if (form.unitPrice &&
             (!/^\d+(\.\d{1,2})?$/.test(form.unitPrice) ||
               Number(form.unitPrice) > 9999999999.99)) {
           next.unitPrice = 'Enter a valid price (up to 2 decimal places)';
         }
         setErrors(next);
         return Object.keys(next).length === 0;
       };

       const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
         event.preventDefault();
         if (saving || !validate()) return;

         const payload: ProductCreateInput = {
           name: form.name.trim(),
           categoryId: form.categoryId,
           sku: form.sku.trim(),
           barcode: form.barcode.trim() || undefined,
           batchNumber: form.batchNumber.trim(),
           quantity: Number(form.quantity),
           manufacturingDate: form.manufacturingDate || undefined,
           expiryDate: form.expiryDate,
           unitPrice: form.unitPrice === '' ? undefined : Number(form.unitPrice),
           supplier: form.supplier.trim(),
           reorderLevel: form.reorderLevel.trim() === ''
             ? undefined : Number(form.reorderLevel)
         };

         setSaving(true);
         setErrors({});
         try {
           // useInventory.addProduct must POST to /api/inventory (Step 2B).
           await addProduct(payload);
           setReviewOpen(false);
           setSuccess(`"${payload.name}" — batch ${payload.batchNumber} saved to PostgreSQL.`);
           setScanStatus('Inventory saved successfully');
         } catch (error) {
           setErrors({
             form: error instanceof Error ? error.message : 'Unable to save inventory'
           });
         } finally {
           setSaving(false);
         }
       };

       return (
         <div className="max-w-5xl mx-auto space-y-6">
           <div className="flex flex-wrap items-center justify-between gap-3">
             <div className="flex items-center gap-3">
               <Link to="/inventory" className="text-sm text-emerald-700 hover:underline inline-flex items-center gap-1">
                 <ArrowLeft size={18} /> Back
               </Link>
               <div>
                 <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                   <ScanLine className="text-emerald-600" /> Scan Medicine
                 </h1>
                 <p className="text-sm text-slate-500">
                   Search real product records and register verified stock batches.
                 </p>
               </div>
             </div>
             <Link to="/add-product">
               <Button variant="outline">Manual Product Entry</Button>
             </Link>
           </div>

           {success && (
             <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 flex flex-wrap items-center justify-between gap-3">
               <p className="flex items-center gap-2 text-sm text-emerald-800">
                 <CheckCircle2 size={20} /> {success}
               </p>
               <Button size="sm" onClick={() => navigate('/inventory')}>
                 View Inventory
               </Button>
             </div>
           )}

           {cameraError && (
             <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex gap-2">
               <AlertCircle className="shrink-0" size={20} /> {cameraError}
             </div>
           )}

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 space-y-4">
               <Card>
                 <CardHeader className="bg-slate-900 text-white">
                   <CardTitle className="text-white flex items-center justify-between gap-2">
                     <span className="flex items-center gap-2"><Camera size={18} /> Camera Scanner</span>
                     <Badge variant={cameraActive ? 'success' : 'default'}>
                       {cameraActive ? 'Live' : 'Stopped'}
                     </Badge>
                   </CardTitle>
                   <p className="text-xs text-slate-300">{scanStatus}</p>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   {/* Always mounted: Html5Qrcode needs this element to exist. */}
                   <div id={SCANNER_ID} className="w-full rounded-lg bg-slate-950 overflow-hidden min-h-[40px]" />
                   {!cameraActive && (
                     <div className="min-h-[180px] flex flex-col items-center justify-center gap-3 text-center bg-slate-50 rounded-lg">
                       <Barcode className="text-emerald-600" size={46} />
                       <p className="text-sm text-slate-600">Scan a product barcode or enter a code below.</p>
                     </div>
                   )}
                   {cameras.length > 0 && !cameraActive && (
                     <label className="text-sm block">
                       <span className="block font-medium mb-1">Camera device</span>
                       <select
                         value={cameraId}
                         onChange={e => setCameraId(e.target.value)}
                         className="w-full border rounded-md p-2"
                       >
                         {cameras.map((camera, index) => (
                           <option key={camera.id} value={camera.id}>
                             {camera.label || `Camera ${index + 1}`}
                           </option>
                         ))}
                       </select>
                     </label>
                   )}
                   <div className="flex flex-wrap gap-2">
                     {!cameraActive ? (
                       <Button onClick={() => void startCamera()} disabled={cameraStarting || lookingUp}>
                         <Camera size={16} className="mr-2" />
                         {cameraStarting ? 'Opening camera...' : 'Start Camera'}
                       </Button>
                     ) : (
                       <Button variant="danger" onClick={() => void stopCamera()}>
                         <CameraOff size={16} className="mr-2" /> Stop Camera
                       </Button>
                     )}
                     {cameraActive && torchSupported && (
                       <Button variant="outline" onClick={() => void toggleTorch()}>
                         {torchOn ? <ZapOff size={16} className="mr-2" /> : <Zap size={16} className="mr-2" />}
                         {torchOn ? 'Flash Off' : 'Flash On'}
                       </Button>
                     )}
                     {cameraActive && (
                       <Button variant="outline" onClick={() => void stopCamera()}>
                         <RefreshCw size={16} className="mr-2" /> Pause Scan
                       </Button>
                     )}
                   </div>
                 </CardContent>
               </Card>

               <Card>
                 <CardHeader>
                   <CardTitle>Search by barcode or SKU</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <form
                     className="flex flex-col sm:flex-row gap-2"
                     onSubmit={event => {
                       event.preventDefault();
                       void handleCodeDetected(manualCode);
                     }}
                   >
                     <input
                       type="text"
                       value={manualCode}
                       onChange={event => setManualCode(event.target.value)}
                       placeholder="Enter a real barcode or SKU"
                       className="border rounded-md p-2 flex-1 text-sm"
                       aria-label="Barcode or SKU"
                     />
                     <Button type="submit" disabled={!manualCode.trim() || lookingUp}>
                       {lookingUp ? 'Searching...' : 'Search Database'}
                     </Button>
                   </form>
                   <p className="text-xs text-slate-500 mt-2">
                     Searches the PostgreSQL product catalog. Does not invent expiry or quantity.
                   </p>
                 </CardContent>
               </Card>
             </div>

             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <ShieldCheck className="text-emerald-600" size={20} /> Scan safely
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-3 text-sm text-slate-600">
                 <p>1. Scan or type the product barcode.</p>
                 <p>2. Confirm the returned medicine name and SKU.</p>
                 <p>3. Read the real batch number, quantity and expiry from the package.</p>
                 <p>4. Save and confirm the batch appears in PostgreSQL.</p>
                 <p className="text-xs text-amber-800 bg-amber-50 rounded-md p-3">
                   QR and DataMatrix symbols can carry structured information. This version does not decode GS1 batch or expiry fields automatically.
                 </p>
               </CardContent>
             </Card>
           </div>

           {reviewOpen && (
             <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
               <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl my-6" role="dialog" aria-modal="true" aria-labelledby="scan-review-title">
                 <div className="flex justify-between items-start border-b p-5 gap-3">
                   <div>
                     <h2 id="scan-review-title" className="font-semibold text-lg">
                       {matchType === 'existing' ? 'Existing product — register new batch' : 'New barcode — enter product details'}
                     </h2>
                     <p className="text-xs text-slate-500 mt-1 break-all">Scanned: {scannedCode}</p>
                     <Badge variant={matchType === 'existing' ? 'info' : 'warning'}>
                       {matchType === 'existing' ? 'Database match' : 'Not in database'}
                     </Badge>
                   </div>
                   <button type="button" disabled={saving} onClick={() => setReviewOpen(false)} aria-label="Close" className="p-1 hover:bg-slate-100 rounded">
                     <X size={20} />
                   </button>
                 </div>
                 <form onSubmit={saveProduct}>
                   <div className="p-5 max-h-[65vh] overflow-y-auto space-y-4">
                     {matchType === 'existing' && (
                       <p className="text-sm rounded-lg border border-amber-200 bg-amber-50 text-amber-800 p-3 flex gap-2">
                         <AlertTriangle size={18} className="shrink-0" /> This product exists already. Enter a different real batch number and verified stock details.
                       </p>
                     )}
                     {errors.form && (
                       <p role="alert" className="text-sm bg-red-50 text-red-700 p-3 rounded">{errors.form}</p>
                     )}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="sm:col-span-2">
                         <Input label="Medicine name *" value={form.name} disabled={matchType === 'existing' || saving}
                           onChange={e => updateForm('name', e.target.value)} error={errors.name} />
                       </div>
                       <Select label="Category *" options={categories.map(c => ({value:c.id, label:c.name}))}
                         value={form.categoryId} disabled={matchType === 'existing' || saving}
                         onChange={e => updateForm('categoryId', e.target.value)} error={errors.categoryId} />
                       <Input label="SKU *" value={form.sku} disabled={matchType === 'existing' || saving}
                         onChange={e => updateForm('sku', e.target.value)} error={errors.sku} />
                       <Input label="Barcode (optional)" value={form.barcode} disabled={matchType === 'existing' || saving}
                         onChange={e => updateForm('barcode', e.target.value)} error={errors.barcode} />
                       <Input label="Batch / lot number *" value={form.batchNumber} disabled={saving}
                         onChange={e => updateForm('batchNumber', e.target.value)} error={errors.batchNumber} />
                       <Input label="Quantity to receive *" type="number" min="1" step="1" value={form.quantity} disabled={saving}
                         onChange={e => updateForm('quantity', e.target.value)} error={errors.quantity} />
                       <Input label="Manufacturing date" type="date" value={form.manufacturingDate} disabled={saving}
                         onChange={e => updateForm('manufacturingDate', e.target.value)} error={errors.manufacturingDate} />
                       <Input label="Expiry date *" type="date" value={form.expiryDate} disabled={saving}
                         onChange={e => updateForm('expiryDate', e.target.value)} error={errors.expiryDate} />
                       <Input label="Unit price (optional)" type="number" min="0" step="0.01" value={form.unitPrice} disabled={saving}
                         onChange={e => updateForm('unitPrice', e.target.value)} error={errors.unitPrice} />
                       <Input label="Supplier *" value={form.supplier} disabled={saving}
                         onChange={e => updateForm('supplier', e.target.value)} error={errors.supplier} />
                       <Input label="Reorder threshold (optional)" type="number" min="0" step="1" value={form.reorderLevel} disabled={matchType === 'existing' || saving}
                         onChange={e => updateForm('reorderLevel', e.target.value)} error={errors.reorderLevel} />
                     </div>
                   </div>
                   <div className="border-t bg-slate-50 p-4 flex flex-wrap justify-end gap-2">
                     <Button type="button" variant="outline" disabled={saving} onClick={() => setReviewOpen(false)}>
                       Cancel
                     </Button>
                     <Button type="submit" disabled={saving}>
                       {saving ? 'Saving...' : 'Save to PostgreSQL'}
                     </Button>
                   </div>
                 </form>
               </div>
             </div>
           )}
         </div>
       );
     }
