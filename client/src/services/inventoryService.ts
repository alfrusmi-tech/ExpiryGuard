import type { Product, Category, Alert, DashboardStats } from '../types';
import { mockProducts, mockCategories } from '../data/mockData';

export const inventoryService = {
  getProducts: async (): Promise<Product[]> => {
    return [...mockProducts];
  },

  getCategories: async (): Promise<Category[]> => {
    return [...mockCategories];
  },

  getAlerts: async (): Promise<Alert[]> => {
    const response = await fetch('/api/alerts');

    if (!response.ok) {
      throw new Error(`Could not load alerts: ${response.status}`);
    }

    const data: Array<{
      id: string;
      productId: number;
      type: Alert['type'];
      message: string;
      date: string;
      resolved: boolean;
    }> = await response.json();

    // React currently uses string IDs; the backend returns numeric IDs.
    return data.map(alert => ({
      ...alert,
      productId: String(alert.productId),
    }));
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const products = mockProducts;

    return {
      totalProducts: products.length,
      totalItems: products.reduce((sum, p) => sum + p.quantity, 0),
      expiringSoon: products.filter(p => p.status === 'expiring_soon').length,
      expiredProducts: products.filter(p => p.status === 'expired').length,
      lowStock: products.filter(p => p.quantity <= p.reorderLevel).length,
    };
  },
};