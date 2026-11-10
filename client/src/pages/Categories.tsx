
import { useState, type FormEvent } from 'react';
import { useInventory } from '../hooks/useInventory';
import { useAuth } from '../context/AuthContext';
import { inventoryService } from '../services/inventoryService';
import {
  Card, CardContent, CardHeader, CardTitle
} from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Plus, Tags } from 'lucide-react';

export function Categories() {
  const {
    categories, products, loading, error, refreshData
  } = useInventory();

  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    if (!isAdmin) {
      setFormError('Only administrators can create categories.');
      return;
    }

    const cleanName = name.trim();

    if (!cleanName) {
      setFormError('Category name is required.');
      return;
    }

    const exists = categories.some(
      c => c.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (exists) {
      setFormError('This category already exists.');
      return;
    }

    setSaving(true);

    try {
      await inventoryService.createCategory(
        cleanName,
        description
      );

      await refreshData();

      setShowForm(false);
      setName('');
      setDescription('');
      setFormError('');
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Unable to save category.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse h-96 bg-slate-200 rounded-xl" />
    );
  }

  if (error) {
    return (
      <div role="alert" className="p-6 border rounded-xl">
        <p className="text-red-700">{error}</p>
        <Button
          type="button"
          onClick={() => void refreshData()}
          className="mt-3"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const categoryStats = categories.map(cat => {
    const batches = products.filter(
      p => p.categoryId === cat.id
    );

    const totalItems = batches.reduce(
      (sum, p) => sum + p.quantity, 0
    );

    const expiringBatches = batches.filter(
      p => p.status === 'expiring_soon' && p.quantity > 0
    ).length;

    return {
      ...cat,
      totalItems,
      expiringBatches
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Category Management
          </h1>
          <p className="text-slate-500">
            Organize your pharmacy inventory into categories.
          </p>
        </div>

        {isAdmin && (
          <Button
            type="button"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryStats.map(category => (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Tags className="w-5 h-5 text-emerald-700" />
                <CardTitle>{category.name}</CardTitle>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-slate-500 mb-6">
                {category.description}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">
                    Products
                  </p>
                  <p className="text-xl font-semibold">
                    {category.itemCount}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Total Items
                  </p>
                  <p className="text-xl font-semibold">
                    {category.totalItems}
                  </p>
                </div>
              </div>

              {category.expiringBatches > 0 && (
                <p className="mt-4 text-sm text-amber-700">
                  {category.expiringBatches} batches expiring soon
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
            {categoryStats.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
          No categories yet.
          {isAdmin
            ? ' Click "Add Category" to create the first one.'
            : ' Ask an administrator to add categories.'}
        </div>
      )}
      
      {showForm && isAdmin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-form-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h2
              id="category-form-title"
              className="text-xl font-bold mb-4"
            >
              Add New Category
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label
                  htmlFor="category-name"
                  className="block text-sm font-medium mb-1"
                >
                  Category Name
                </label>
                <input
                  id="category-name"
                  type="text"
                  maxLength={100}
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border rounded-lg p-2"
                  placeholder="e.g. Antibiotics"
                />
              </div>

              <div>
                <label
                  htmlFor="category-description"
                  className="block text-sm font-medium mb-1"
                >
                  Description
                </label>
                <textarea
                  id="category-description"
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full border rounded-lg p-2"
                  placeholder="Enter category description"
                />
              </div>

              {formError && (
                <p role="alert" className="text-sm text-red-600">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={() => {
                    setShowForm(false);
                    setFormError('');
                  }}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
