import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { useInventory } from '../hooks/useInventory';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export function AddProduct() {
  const navigate = useNavigate();
  const { categories } = useInventory();
  
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    sku: '',
    batchNumber: '',
    quantity: '',
    expiryDate: '',
    supplier: '',
    reorderLevel: '10'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!formData.name) newErrors.name = 'Product name is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.sku) newErrors.sku = 'SKU is required';
    if (!formData.batchNumber) newErrors.batchNumber = 'Batch number is required';
    if (!formData.quantity || isNaN(Number(formData.quantity)) || Number(formData.quantity) < 0) {
      newErrors.quantity = 'Valid quantity is required';
    }
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/inventory');
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/inventory">
          <Button variant="ghost" size="sm" className="px-2">
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Add New Product</h1>
          <p className="text-slate-500 text-sm">Enter the product details into the inventory system.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Product Name *" 
                name="name" 
                placeholder="e.g. Organic Whole Milk" 
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
                label="SKU *" 
                name="sku" 
                placeholder="e.g. DAI-001" 
                value={formData.sku}
                onChange={handleChange}
                error={errors.sku}
              />

              <Input 
                label="Batch Number *" 
                name="batchNumber" 
                placeholder="e.g. B-1001" 
                value={formData.batchNumber}
                onChange={handleChange}
                error={errors.batchNumber}
              />

              <Input 
                label="Quantity *" 
                name="quantity" 
                type="number"
                min="0"
                value={formData.quantity}
                onChange={handleChange}
                error={errors.quantity}
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
                label="Supplier" 
                name="supplier" 
                placeholder="e.g. Dairy Farms Inc"
                value={formData.supplier}
                onChange={handleChange}
              />

              <Input 
                label="Reorder Level" 
                name="reorderLevel" 
                type="number"
                min="0"
                value={formData.reorderLevel}
                onChange={handleChange}
              />
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md flex items-center text-sm border border-red-100">
                <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                Please correct the errors above before submitting.
              </div>
            )}

            <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
              <Link to="/inventory">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Product
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
