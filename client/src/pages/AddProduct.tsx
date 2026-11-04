import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { useInventory } from '../hooks/useInventory';
import { ArrowLeft, Save, AlertCircle, ScanLine, CheckCircle2 } from 'lucide-react';

export function AddProduct() {
  const navigate = useNavigate();
  const { categories, addProduct } = useInventory();
  
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    sku: '',
    barcode: '',
    batchNumber: '',
    quantity: '',
    manufacturingDate: '',
    expiryDate: '',
    unitPrice: '',
    supplier: '',
    reorderLevel: '15'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // clear error
    if (errors[name]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Medicine / Product name is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU / Item code is required';
    if (!formData.batchNumber.trim()) newErrors.batchNumber = 'Batch lot number is required';
    if (!formData.quantity || isNaN(Number(formData.quantity)) || Number(formData.quantity) < 0) {
      newErrors.quantity = 'Valid quantity (0 or greater) is required';
    }
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (formData.manufacturingDate && new Date(formData.manufacturingDate) > new Date(formData.expiryDate)) {
      newErrors.manufacturingDate = 'Manufacturing date cannot be after expiry date';
    }

    if (formData.unitPrice && (isNaN(Number(formData.unitPrice)) || Number(formData.unitPrice) < 0)) {
      newErrors.unitPrice = 'Unit price must be a valid positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await addProduct({
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        sku: formData.sku.trim(),
        barcode: formData.barcode.trim() || undefined,
        batchNumber: formData.batchNumber.trim(),
        quantity: Number(formData.quantity),
        manufacturingDate: formData.manufacturingDate || undefined,
        expiryDate: formData.expiryDate,
        unitPrice: formData.unitPrice ? Number(formData.unitPrice) : undefined,
        supplier: formData.supplier.trim() || 'General Pharma Supplier',
        reorderLevel: Number(formData.reorderLevel) || 15
      });

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/inventory');
      }, 700);
    } catch (err) {
      console.error('Failed to add product:', err);
      setErrors({ form: 'An unexpected error occurred while saving the product.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link to="/inventory">
            <Button variant="ghost" size="sm" className="px-2.5 text-slate-600 hover:text-emerald-700">
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Add Medicine / Product</h1>
            <p className="text-slate-500 text-sm">Register a new product manually into the pharmacy inventory.</p>
          </div>
        </div>

        <Link to="/scan-product">
          <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 shadow-2xs">
            <ScanLine className="w-4 h-4 mr-2 text-emerald-600" />
            Switch to Camera Scanner
          </Button>
        </Link>
      </div>

      {/* Camera Scan Prompt Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0">
            <ScanLine className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-950">Have a barcode or QR code on the packaging?</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Use your device camera to automatically scan the medicine label, batch number, and expiry date.
            </p>
          </div>
        </div>
        <Link to="/scan-product" className="shrink-0">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs">
            Open Scanner
          </Button>
        </Link>
      </div>

      {/* Success banner */}
      {isSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center text-emerald-800 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2 shrink-0" />
          Product successfully added to inventory! Redirecting to inventory table...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-base text-slate-900">Pharmaceutical Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Medicine / Product Name *" 
                name="name" 
                placeholder="e.g. Amoxicillin 500mg Capsules" 
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
              />
              
              <Select 
                label="Category *" 
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                error={errors.categoryId}
                options={categories.map(c => ({ value: c.id, label: c.name }))}
              />

              <Input 
                label="SKU / Item Code *" 
                name="sku" 
                placeholder="e.g. MED-003" 
                value={formData.sku}
                onChange={handleChange}
                error={errors.sku}
              />

              <Input 
                label="Barcode / GTIN / QR Code" 
                name="barcode" 
                placeholder="e.g. 8901030099881" 
                value={formData.barcode}
                onChange={handleChange}
                error={errors.barcode}
              />

              <Input 
                label="Batch / Lot Number *" 
                name="batchNumber" 
                placeholder="e.g. LOT-2026-X1" 
                value={formData.batchNumber}
                onChange={handleChange}
                error={errors.batchNumber}
              />

              <Input 
                label="Quantity in Stock *" 
                name="quantity" 
                type="number"
                min="0"
                placeholder="e.g. 100"
                value={formData.quantity}
                onChange={handleChange}
                error={errors.quantity}
              />

              <Input 
                label="Manufacturing Date" 
                name="manufacturingDate" 
                type="date"
                value={formData.manufacturingDate}
                onChange={handleChange}
                error={errors.manufacturingDate}
              />

              <Input 
                label="Expiry Date *" 
                name="expiryDate" 
                type="date"
                value={formData.expiryDate}
                onChange={handleChange}
                error={errors.expiryDate}
              />

              <Input 
                label="Unit Price ($)" 
                name="unitPrice" 
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 14.50"
                value={formData.unitPrice}
                onChange={handleChange}
                error={errors.unitPrice}
              />

              <Input 
                label="Supplier / Manufacturer" 
                name="supplier" 
                placeholder="e.g. GlaxoSmithKline Pharma"
                value={formData.supplier}
                onChange={handleChange}
              />

              <Input 
                label="Reorder Alert Threshold" 
                name="reorderLevel" 
                type="number"
                min="0"
                placeholder="e.g. 15"
                value={formData.reorderLevel}
                onChange={handleChange}
              />
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="p-3.5 bg-red-50 text-red-700 rounded-xl flex items-center text-sm border border-red-200">
                <AlertCircle className="w-5 h-5 mr-2 shrink-0 text-red-600" />
                Please correct the highlighted errors before saving.
              </div>
            )}

            <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
              <Link to="/inventory">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={isSubmitting || isSuccess} className="shadow-sm">
                {isSubmitting ? (
                  <span className="flex items-center">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                    Saving Product...
                  </span>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save to Inventory
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
