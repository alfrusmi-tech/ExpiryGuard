import { Product, Category, Alert, DashboardStats } from '../types';
import { mockProducts, mockCategories, mockAlerts } from '../data/mockData';

// This is a mock service. In the future, these will be replaced with real axios/fetch calls to the REST API.
export const inventoryService = {
  getProducts: async (): Promise<Product[]> => {
    return [...mockProducts];
  },
  
  getCategories: async (): Promise<Category[]> => {
    return [...mockCategories];
  },

  getAlerts: async (): Promise<Alert[]> => {
    return [...mockAlerts];
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
  }
};
