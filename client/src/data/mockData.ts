import { Category, Product, Alert } from '../types';
import { addDays, subDays, format } from 'date-fns';
import { getExpiryStatus } from '../utils/expiryUtils';

const today = new Date();

// Generate dynamic dates so mock data is always relevant
const dateExpired = format(subDays(today, 5), 'yyyy-MM-dd');
const dateExpiringCritical = format(addDays(today, 3), 'yyyy-MM-dd');
const dateExpiringSoon = format(addDays(today, 15), 'yyyy-MM-dd');
const dateGood = format(addDays(today, 180), 'yyyy-MM-dd');

export const mockCategories: Category[] = [
  { id: 'c1', name: 'Dairy', description: 'Milk, cheese, yogurt', itemCount: 3 },
  { id: 'c2', name: 'Snacks', description: 'Biscuits, chips, nuts', itemCount: 1 },
  { id: 'c3', name: 'Medicine', description: 'Pharmacy and healthcare', itemCount: 2 },
  { id: 'c4', name: 'Canned Goods', description: 'Long shelf-life foods', itemCount: 1 },
  { id: 'c5', name: 'Beverages', description: 'Juices, sodas, water', itemCount: 1 },
  { id: 'c6', name: 'Produce', description: 'Fresh vegetables and fruits', itemCount: 1 },
  { id: 'c7', name: 'Cosmetics', description: 'Beauty and personal care', itemCount: 1 },
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Whole Milk 1L',
    categoryId: 'c1',
    sku: 'DAI-001',
    batchNumber: 'B-1001',
    quantity: 45,
    expiryDate: dateExpiringCritical,
    supplier: 'Dairy Farms Inc',
    reorderLevel: 20
  },
  {
    id: 'p2',
    name: 'Greek Yogurt',
    categoryId: 'c1',
    sku: 'DAI-002',
    batchNumber: 'B-1002',
    quantity: 12, // low stock
    expiryDate: dateExpired,
    supplier: 'Dairy Farms Inc',
    reorderLevel: 20
  },
  {
    id: 'p3',
    name: 'Digestive Biscuits',
    categoryId: 'c2',
    sku: 'SNK-001',
    batchNumber: 'B-2001',
    quantity: 120,
    expiryDate: dateGood,
    supplier: 'SnackCo',
    reorderLevel: 50
  },
  {
    id: 'p4',
    name: 'Paracetamol 500mg',
    categoryId: 'c3',
    sku: 'MED-001',
    batchNumber: 'M-5001',
    quantity: 200,
    expiryDate: dateGood,
    supplier: 'PharmaLife',
    reorderLevel: 50
  },
  {
    id: 'p5',
    name: 'Cough Syrup',
    categoryId: 'c3',
    sku: 'MED-002',
    batchNumber: 'M-5002',
    quantity: 5, // low stock
    expiryDate: dateExpiringSoon,
    supplier: 'PharmaLife',
    reorderLevel: 15
  },
  {
    id: 'p6',
    name: 'Canned Beans',
    categoryId: 'c4',
    sku: 'CAN-001',
    batchNumber: 'C-3001',
    quantity: 300,
    expiryDate: dateGood,
    supplier: 'PreserveFoods',
    reorderLevel: 100
  },
  {
    id: 'p7',
    name: 'Orange Juice 2L',
    categoryId: 'c5',
    sku: 'BEV-001',
    batchNumber: 'J-4001',
    quantity: 60,
    expiryDate: dateExpiringCritical,
    supplier: 'FreshSqueeze',
    reorderLevel: 30
  },
  {
    id: 'p8',
    name: 'Fresh Spinach',
    categoryId: 'c6',
    sku: 'PRO-001',
    batchNumber: 'V-6001',
    quantity: 25,
    expiryDate: dateExpired,
    supplier: 'Local Farm',
    reorderLevel: 10
  },
  {
    id: 'p9',
    name: 'Moisturizing Lotion',
    categoryId: 'c7',
    sku: 'COS-001',
    batchNumber: 'B-7001',
    quantity: 85,
    expiryDate: dateExpiringSoon,
    supplier: 'BeautyBrands',
    reorderLevel: 30
  },
].map(product => ({
  ...product,
  status: getExpiryStatus(product.expiryDate)
}));

export const mockAlerts: Alert[] = mockProducts
  .filter(p => p.status !== 'good' || p.quantity <= p.reorderLevel)
  .map(p => {
    let type: Alert['type'] = 'expiring_soon';
    let message = `${p.name} is expiring soon.`;
    
    if (p.status === 'expired') {
      type = 'expired';
      message = `${p.name} has expired!`;
    } else if (p.quantity <= p.reorderLevel) {
      type = 'low_stock';
      message = `${p.name} is running low (${p.quantity} left).`;
    }

    return {
      id: `a-${p.id}`,
      productId: p.id,
      type,
      message,
      date: format(today, 'yyyy-MM-dd'),
      resolved: false
    };
  });
