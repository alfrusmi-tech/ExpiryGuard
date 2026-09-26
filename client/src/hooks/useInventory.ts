import { useState, useEffect } from 'react';
import { Product, Category, Alert, DashboardStats } from '../types';
import { inventoryService } from '../services/inventoryService';

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
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
    }
    loadData();
  }, []);

  return {
    products,
    categories,
    alerts,
    stats,
    loading
  };
}
