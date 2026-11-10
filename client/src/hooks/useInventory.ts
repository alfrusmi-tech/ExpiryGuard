
import { useState, useEffect, useCallback } from 'react';
import type {Product,ProductCreateInput,Category,Alert,DashboardStats} from '../types';
import { inventoryService } from '../services/inventoryService';

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [p, c, a, s] = await Promise.all([
         inventoryService.getProducts(),
         inventoryService.getCategories(),
         inventoryService.getAlerts(),
         inventoryService.getDashboardStats()
        ]);

      setProducts(p);
      setAlerts(a);
      setStats(s);

      // Count distinct catalog products rather than batches
      const uniqueProducts = new Set(
        p.map(item => item.productId ?? item.id)
      );

      setCategories(c.map(category => ({
        ...category,
        itemCount: new Set(
          p.filter(item => item.categoryId === category.id)
            .map(item => item.productId ?? item.id)
        ).size
      })));

    } catch (err) {
      console.error('Failed to load inventory:', err);
      setError(
        err instanceof Error ? err.message : 'Inventory load failed'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();

    const handleUpdate = () => {
      void loadData();
    };

    window.addEventListener(
      'expiryguard-inventory-updated',
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        'expiryguard-inventory-updated',
        handleUpdate
      );
    };
  }, [loadData]);

  const addProduct = async (
    data: ProductCreateInput
  ) => {
    const created = await inventoryService.addProduct(data);
    await loadData();
    return created;
  };

  return { products, categories, alerts, stats, loading,
    error, refreshData: loadData, addProduct
  };
}
