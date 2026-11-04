import { useState, useEffect, useCallback } from 'react';
import { Product, Category, Alert, DashboardStats } from '../types';
import { inventoryService } from '../services/inventoryService';

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [p, c, a, s] = await Promise.all([
        inventoryService.getProducts(),
        inventoryService.getCategories(),
        inventoryService.getAlerts(),
        inventoryService.getDashboardStats()
      ]);
      setProducts(p);
      setCategories(c);
      setAlerts(a);
      setStats(s);
    } catch (error) {
      console.error("Failed to load inventory data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Listen for cross-component inventory updates
    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('expiryguard-inventory-updated', handleUpdate);
    return () => {
      window.removeEventListener('expiryguard-inventory-updated', handleUpdate);
    };
  }, [loadData]);

  const addProduct = async (productData: Omit<Product, 'id'> | Product) => {
    const created = await inventoryService.addProduct(productData);
    await loadData();
    return created;
  };

  return {
    products,
    categories,
    alerts,
    stats,
    loading,
    refreshData: loadData,
    addProduct
  };
}
