export type ExpiryStatus = 'good' | 'expiring_soon' | 'expired';

export interface Category {
  id: string;
  name: string;
  description: string;
  itemCount: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  sku: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string; // ISO format YYYY-MM-DD
  supplier: string;
  reorderLevel: number;
  status?: ExpiryStatus; // Can be computed on the fly
}

export interface Alert {
  id: string;
  productId: string;
  type: 'expired' | 'expiring_soon' | 'low_stock';
  message: string;
  date: string;
  resolved: boolean;
}

export interface DashboardStats {
  totalProducts: number;
  totalItems: number;
  expiringSoon: number;
  expiredProducts: number;
  lowStock: number;
}
