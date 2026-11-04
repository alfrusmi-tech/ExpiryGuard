import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { 
  ScanLine, 
  ArrowLeft, 
  Edit3, 
  Info, 
  CheckCircle2, 
  Barcode, 
  ShieldCheck, 
  Package
} from 'lucide-react';

export function ScanProduct() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
              Scan Medicine Label or Barcode
            </h1>
            <p className="text-slate-500 text-sm">
              Use product packaging or 2D DataMatrix barcodes to register medicines into inventory.
            </p>
          </div>
        </div>

        <Link to="/add-product">
          <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
            <Edit3 className="w-4 h-4 mr-2" />
            Switch to Manual Entry
          </Button>
        </Link>
      </div>

      {/* Notice Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
        <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-emerald-950">
            Product scanning will be available in a future update
          </h3>
          <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
            The optical recognition and GS1 barcode decoder module is currently being integrated for hardware scanner and mobile camera support. You can add medicines immediately using the manual form.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scanner Viewfinder Mockup */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between py-3 border-none">
            <CardTitle className="text-sm text-slate-200 font-medium flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Optical Scanner Interface
            </CardTitle>
            <span className="text-xs text-slate-400 font-mono">STANDBY MODE</span>
          </CardHeader>

          <CardContent className="p-6 md:p-8 bg-slate-950 flex flex-col items-center justify-center min-h-[380px] relative">
            {/* Camera Viewfinder Frame */}
            <div className="relative w-full max-w-sm aspect-[4/3] rounded-2xl border-2 border-dashed border-emerald-500/40 bg-emerald-950/20 p-6 flex flex-col items-center justify-center overflow-hidden">
              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg"></div>
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg"></div>
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg"></div>
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br-lg"></div>

              {/* Center icon / placeholder visual */}
              <div className="p-4 rounded-2xl bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 mb-3 shadow-inner">
                <Barcode className="w-12 h-12" />
              </div>

              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300 text-center">
                Position Medicine Barcode Inside Frame
              </p>
              <p className="text-[11px] text-slate-400 text-center mt-1 max-w-[220px]">
                Supports GS1 DataMatrix, UPC-A, EAN-13, and pharmaceutical QR labels
              </p>

              {/* Simulated Scan Beam */}
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(52,211,153,0.8)]"></div>
            </div>

            {/* Bottom Actions inside Mock Viewfinder */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
              <Link to="/add-product" className="w-full">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-md">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Enter Details Manually
                </Button>
              </Link>
              <Link to="/inventory" className="w-full">
                <Button variant="outline" className="w-full bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800">
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Workflow Explanation */}
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Intended Scan Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Scan Barcode / Label</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Align the medicine package barcode or prescription label with the scanner camera.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Auto-Extract Medicine Data</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    The system decodes the NDC/SKU, batch lot, and manufacturer expiry date.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Review & Save to Stock</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Confirm quantity on hand and verify the details before saving into inventory.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-slate-50/50">
            <CardContent className="p-5 flex items-center gap-3">
              <Package className="w-8 h-8 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-900">Need immediate entry?</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Use the manual form to add products without waiting for scanning hardware.
                </p>
                <Link to="/add-product" className="inline-block mt-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline">
                  Go to Add Product Form &rarr;
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
