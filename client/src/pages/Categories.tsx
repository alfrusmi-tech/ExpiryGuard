import React from 'react';
import { useInventory } from '../hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Plus, Tags, MoreHorizontal } from 'lucide-react';

export function Categories() {
  const { categories, products, loading } = useInventory();

  if (loading) {
    return <div className="animate-pulse h-96 bg-slate-200 rounded-xl"></div>;
  }

  // Calculate real metrics from products array
  const categoryStats = categories.map(cat => {
    const catProducts = products.filter(p => p.categoryId === cat.id);
    const totalItems = catProducts.reduce((sum, p) => sum + p.quantity, 0);
    const expiringSoon = catProducts.filter(p => p.status === 'expiring_soon').length;
    
    return {
      ...cat,
      uniqueProducts: catProducts.length,
      totalItems,
      expiringSoon
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Category Management</h1>
          <p className="text-slate-500">Organize your inventory into logical groupings.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryStats.map(category => (
          <Card key={category.id} className="hover:border-blue-300 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                  <Tags className="w-5 h-5" />
                </div>
                <CardTitle>{category.name}</CardTitle>
              </div>
              <button className="text-slate-400 hover:text-slate-700 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-6">{category.description}</p>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Products</p>
                  <p className="text-xl font-semibold text-slate-900 mt-1">{category.uniqueProducts}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Items</p>
                  <p className="text-xl font-semibold text-slate-900 mt-1">{category.totalItems}</p>
                </div>
                {category.expiringSoon > 0 && (
                  <div className="col-span-2 mt-2 p-2 bg-amber-50 rounded text-amber-700 text-sm flex items-center">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                    {category.expiringSoon} products expiring soon
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
