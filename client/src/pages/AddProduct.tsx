
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../components/common/Card';

import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { useInventory } from '../hooks/useInventory';

import type { ProductCreateInput } from '../types';

import {
  ArrowLeft,
  Save,
  AlertCircle,
  ScanLine,
  CheckCircle2
} from 'lucide-react';

// Initial form values
const initialForm = {
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
  reorderLevel: ''
};

type FormData = typeof initialForm;
type FormErrors = Partial<
  Record<keyof FormData | 'form', string>
>;

export function AddProduct() {
  const navigate = useNavigate();

  const {
    categories,
    addProduct,
    loading
  } = useInventory();

  const [formData, setFormData] =
    useState<FormData>(initialForm);

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isSuccess, setIsSuccess] =
    useState(false);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const field = e.target.name as keyof FormData;
    const value = e.target.value;

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    setErrors(prev => ({
      ...prev,
      [field]: undefined,
      form: undefined
    }));
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Product name
    if (!formData.name.trim()) {
      newErrors.name =
        'Medicine / Product name is required';
    }

    // Category
    if (
      !formData.categoryId ||
      !categories.some(
        c => c.id === formData.categoryId
      )
    ) {
      newErrors.categoryId =
        'Please select a valid category';
    }

    // SKU
    if (!formData.sku.trim()) {
      newErrors.sku =
        'SKU / Item code is required';
    }

    // Barcode
    if (formData.barcode.trim().length > 64) {
      newErrors.barcode =
        'Barcode must not exceed 64 characters';
    }

    // Batch number
    if (!formData.batchNumber.trim()) {
      newErrors.batchNumber =
        'Batch / Lot number is required';
    }

    // Quantity
    const quantity = Number(formData.quantity);

    if (
      formData.quantity.trim() === '' ||
      !Number.isSafeInteger(quantity) ||
      quantity <= 0
    ) {
      newErrors.quantity =
        'Quantity must be a positive whole number';
    }

    // Expiry date
    if (!formData.expiryDate) {
      newErrors.expiryDate =
        'Expiry date is required';
    }

    // Manufacturing date
    if (
      formData.manufacturingDate &&
      formData.expiryDate &&
      formData.manufacturingDate > formData.expiryDate
    ) {
      newErrors.manufacturingDate =
        'Manufacturing date cannot be after expiry date';
    }

    // Price
    if (formData.unitPrice.trim() !== '') {
      const price = Number(formData.unitPrice);

      if (
        !Number.isFinite(price) ||
        price < 0 ||
        !/^\d+(\.\d{1,2})?$/.test(
          formData.unitPrice
        )
      ) {
        newErrors.unitPrice =
          'Enter a valid price with up to 2 decimal places';
      }
    }

    // Supplier
    if (!formData.supplier.trim()) {
      newErrors.supplier =
        'Supplier / Manufacturer is required';
    }

    // Reorder level
    const reorderLevel =
      Number(formData.reorderLevel);

    if (
      (formData.reorderLevel.trim() !== '' &&
        (!Number.isSafeInteger(reorderLevel) || reorderLevel < 0))
    ) {
      newErrors.reorderLevel =
        'Reorder threshold must be 0 or greater';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Save medicine to backend
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (isSubmitting || isSuccess) {
      return;
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const productData: ProductCreateInput = {
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        sku: formData.sku.trim(),

        barcode:
          formData.barcode.trim() || undefined,

        batchNumber:
          formData.batchNumber.trim(),

        quantity:
          Number(formData.quantity),

        manufacturingDate:
          formData.manufacturingDate || undefined,

        expiryDate:
          formData.expiryDate,

        unitPrice:
          formData.unitPrice.trim() !== ''
            ? Number(formData.unitPrice)
            : undefined,

        supplier:
          formData.supplier.trim(),

        reorderLevel: formData.reorderLevel.trim() === ''
          ? undefined
          : Number(formData.reorderLevel)
      };

      // Calls inventoryService.addProduct(),
      // which sends POST /api/inventory
      await addProduct(productData);

      // Only show success after API succeeds
      setIsSuccess(true);

      // Navigate to inventory page
      setTimeout(() => {
        navigate('/inventory');
      }, 700);

    } catch (err) {
      console.error(
        'Failed to save medicine:',
        err
      );

      setErrors({
        form: err instanceof Error
          ? err.message
          : 'Unable to save medicine. Please try again.'
      });

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div className="flex items-center space-x-3">

          <Link
            to="/inventory"
            className="inline-flex items-center text-sm text-slate-600 hover:text-emerald-700"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Add Medicine / Product
            </h1>

            <p className="text-slate-500 text-sm">
              Register a medicine and its batch
              in the pharmacy inventory.
            </p>
          </div>
        </div>

        <Link
          to="/scan-product"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-sm"
        >
          <ScanLine className="w-4 h-4 mr-2" />
          Switch to Camera Scanner
        </Link>

      </div>

      {/* Scanner Information */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-4">

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-600 text-white">
            <ScanLine className="w-5 h-5" />
          </div>

          <div>
            <p className="text-sm font-semibold text-emerald-950">
              Have a barcode or QR code?
            </p>

            <p className="text-xs text-emerald-700 mt-1">
              Scan the product code, then verify
              its batch number, quantity and expiry date.
            </p>
          </div>
        </div>

        <Link
          to="/scan-product"
          className="text-sm font-semibold text-emerald-700 hover:underline shrink-0"
        >
          Open Scanner
        </Link>
      </div>

      {/* Success Message */}
      {isSuccess && (
        <div
          role="status"
          className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center text-emerald-800 text-sm font-medium"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2" />

          Medicine successfully saved
          to inventory! Redirecting...
        </div>
      )}

      {/* Backend Error */}
      {errors.form && (
        <div
          role="alert"
          className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start"
        >
          <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
          <span>{errors.form}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>

        <Card className="border-slate-200/80 shadow-sm">

          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-base text-slate-900">
              Pharmaceutical Product Details
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Product Name */}
              <Input
                label="Medicine / Product Name *"
                name="name"
                placeholder="e.g. Amoxicillin 500mg Capsules"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                disabled={isSubmitting || isSuccess}
              />

              {/* Category */}
              <Select
                label="Category *"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                error={errors.categoryId}
                disabled={
                  loading ||
                  isSubmitting ||
                  isSuccess
                }
                options={categories.map(c => ({
                  value: c.id,
                  label: c.name
                }))}
              />

              {/* SKU */}
              <Input
                label="SKU / Item Code *"
                name="sku"
                placeholder="e.g. MED-003"
                value={formData.sku}
                onChange={handleChange}
                error={errors.sku}
                disabled={isSubmitting || isSuccess}
              />

              {/* Barcode */}
              <Input
                label="Barcode / GTIN / QR Code"
                name="barcode"
                placeholder="e.g. 8901030099881"
                maxLength={64}
                value={formData.barcode}
                onChange={handleChange}
                error={errors.barcode}
                disabled={isSubmitting || isSuccess}
              />

              {/* Batch */}
              <Input
                label="Batch / Lot Number *"
                name="batchNumber"
                placeholder="e.g. LOT-2026-X1"
                value={formData.batchNumber}
                onChange={handleChange}
                error={errors.batchNumber}
                disabled={isSubmitting || isSuccess}
              />

              {/* Quantity */}
              <Input
                label="Quantity in Stock *"
                name="quantity"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 100"
                value={formData.quantity}
                onChange={handleChange}
                error={errors.quantity}
                disabled={isSubmitting || isSuccess}
              />

              {/* Manufacturing Date */}
              <Input
                label="Manufacturing Date"
                name="manufacturingDate"
                type="date"
                value={formData.manufacturingDate}
                onChange={handleChange}
                error={errors.manufacturingDate}
                disabled={isSubmitting || isSuccess}
              />

              {/* Expiry Date */}
              <Input
                label="Expiry Date *"
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={handleChange}
                error={errors.expiryDate}
                disabled={isSubmitting || isSuccess}
              />

              {/* Price */}
              <Input
                label="Unit Price"
                name="unitPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 14.50"
                value={formData.unitPrice}
                onChange={handleChange}
                error={errors.unitPrice}
                disabled={isSubmitting || isSuccess}
              />

              {/* Supplier */}
              <Input
                label="Supplier / Manufacturer *"
                name="supplier"
                placeholder="e.g. ABC Pharma"
                value={formData.supplier}
                onChange={handleChange}
                error={errors.supplier}
                disabled={isSubmitting || isSuccess}
              />

              {/* Reorder Level */}
              <Input
                label="Reorder Alert Threshold (optional)"
                name="reorderLevel"
                type="number"
                min="0"
                step="1"
                placeholder="Blank = Settings default"
                value={formData.reorderLevel}
                onChange={handleChange}
                error={errors.reorderLevel}
                disabled={isSubmitting || isSuccess}
              />

            </div>

            {/* Validation Error Message */}
            {Object.entries(errors).some(
              ([key, value]) => key !== 'form' && value
            ) && (
              <div
                role="alert"
                className="p-3.5 bg-red-50 text-red-700 rounded-xl flex items-center text-sm border border-red-200"
              >
                <AlertCircle className="w-5 h-5 mr-2 shrink-0 text-red-600" />
                Please correct the highlighted fields
                before saving.
              </div>
            )}

            {/* No Categories Warning */}
            {!loading && categories.length === 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                No categories are available.
                Create a category before adding medicine.
              </div>
            )}

            {/* Buttons */}
            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">

              <Link
                to="/inventory"
                className="inline-flex items-center justify-center h-10 px-4 rounded-md border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </Link>

              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  isSuccess ||
                  loading ||
                  categories.length === 0
                }
                className="shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Saving Product...
                  </>
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
