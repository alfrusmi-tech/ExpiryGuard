
import type {
  Product,
  ProductCreateInput,
  Category,
  Alert,
  DashboardStats
} from '../types';

import { apiRequest } from './apiClient';

interface InventoryApiRow {
  id: string;
  productId: string;
  name: string;
  categoryId: string;
  sku: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  supplier: string;
  reorderLevel: number;
  status: Product['status'];
  barcode?: string | null;
  manufacturingDate?: string | null;
  unitPrice?: number | null;
}

interface ApiCategory {
  id: number;
  name: string;
  description: string | null;
}

interface ApiAlert {
  id: string;
  productId: number;
  batchId: number | null;
  type: Alert['type'];
  message: string;
  date: string;
  resolved: boolean;
}

function mapProduct(row: InventoryApiRow): Product {
  return {
    ...row,
    barcode: row.barcode ?? undefined,
    manufacturingDate: row.manufacturingDate ?? undefined,
    unitPrice: row.unitPrice ?? undefined
  };
}

export const inventoryService = {

  // 1. Retrieve inventory from PostgreSQL
  getProducts: async (): Promise<Product[]> => {
    const rows = await apiRequest<InventoryApiRow[]>(
      '/inventory'
    );

    return rows.map(mapProduct);
  },

  // 2. Retrieve categories
  getCategories: async (): Promise<Category[]> => {
    const data = await apiRequest<ApiCategory[]>(
      '/categories'
    );

    return data.map(category => ({
      id: String(category.id),
      name: category.name,
      description: category.description ?? '',
      itemCount: 0
    }));
  },

  // 3. Create a new category in PostgreSQL
  createCategory: async (
    name: string,
    description: string
  ): Promise<Category> => {

    const cleanName = name.trim();
    const cleanDescription = description.trim();

    if (!cleanName) {
      throw new Error('Category name is required');
    }

    const created = await apiRequest<ApiCategory>(
      '/categories',
      {
        method: 'POST',
        body: JSON.stringify({
          name: cleanName,
          description: cleanDescription
        })
      }
    );

    return {
      id: String(created.id),
      name: created.name,
      description: created.description ?? '',
      itemCount: 0
    };
  },

  // 4. Retrieve expiry and low-stock alerts
  getAlerts: async (): Promise<Alert[]> => {
    const data = await apiRequest<ApiAlert[]>(
      '/alerts'
    );

    return data.map(alert => ({
      id: alert.id,
      productId: String(alert.productId),
      batchId: alert.batchId == null
        ? undefined
        : String(alert.batchId),
      type: alert.type,
      message: alert.message,
      date: alert.date,
      resolved: alert.resolved
    }));
  },

  // 5. Retrieve dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    return apiRequest<DashboardStats>(
      '/dashboard/stats'
    );
  },

  // 6. Save medicine and batch to PostgreSQL
 addProduct: async (
  newProduct: ProductCreateInput
): Promise<Product> => {

    const created = await apiRequest<InventoryApiRow>(
      '/inventory',
      {
        method: 'POST',
        body: JSON.stringify({
          name: newProduct.name,
          sku: newProduct.sku,
          barcode: newProduct.barcode || null,
          categoryId: Number(newProduct.categoryId),
          reorderLevel: newProduct.reorderLevel,
          batchNumber: newProduct.batchNumber,
          quantity: newProduct.quantity,
          manufacturingDate:
            newProduct.manufacturingDate || null,
          expiryDate: newProduct.expiryDate,
          unitPrice: newProduct.unitPrice ?? null,
          supplier: newProduct.supplier
        })
      }
    );

    return mapProduct(created);
  },

  // 7. Search existing inventory
  findProductByCode: async (
    code: string
  ): Promise<Product | null> => {

    const search = code.trim().toLowerCase();

    if (!search) return null;

    const products = await inventoryService.getProducts();

    return products.find(product =>
      product.sku.toLowerCase() === search ||
      product.barcode?.toLowerCase() === search ||
      product.batchNumber.toLowerCase() === search
    ) ?? null;
  }

};
