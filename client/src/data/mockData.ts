import { Category, Product, Alert } from '../types';
import { addDays, subDays, format } from 'date-fns';
import { getExpiryStatus } from '../utils/expiryUtils';

const today = new Date();

// Generate dynamic dates so mock data is always relevant
const dateExpired = format(subDays(today, 5), 'yyyy-MM-dd');
const dateExpiringCritical = format(addDays(today, 3), 'yyyy-MM-dd');
const dateExpiringSoon = format(addDays(today, 15), 'yyyy-MM-dd');
const dateGood = format(addDays(today, 180), 'yyyy-MM-dd');
const dateMfd = format(subDays(today, 90), 'yyyy-MM-dd');

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
    barcode: '8901001000018',
    batchNumber: 'B-1001',
    quantity: 45,
    manufacturingDate: dateMfd,
    expiryDate: dateExpiringCritical,
    supplier: 'Dairy Farms Inc',
    unitPrice: 3.50,
    reorderLevel: 20
  },
  {
    id: 'p2',
    name: 'Greek Yogurt',
    categoryId: 'c1',
    sku: 'DAI-002',
    barcode: '8901001000025',
    batchNumber: 'B-1002',
    quantity: 12, // low stock
    manufacturingDate: dateMfd,
    expiryDate: dateExpired,
    supplier: 'Dairy Farms Inc',
    unitPrice: 4.25,
    reorderLevel: 20
  },
  {
    id: 'p3',
    name: 'Digestive Biscuits',
    categoryId: 'c2',
    sku: 'SNK-001',
    barcode: '8901002000032',
    batchNumber: 'B-2001',
    quantity: 120,
    manufacturingDate: dateMfd,
    expiryDate: dateGood,
    supplier: 'SnackCo',
    unitPrice: 2.10,
    reorderLevel: 50
  },
  {
    id: 'p4',
    name: 'Paracetamol 500mg',
    categoryId: 'c3',
    sku: 'MED-001',
    barcode: '8901030012345',
    batchNumber: 'M-5001',
    quantity: 200,
    manufacturingDate: dateMfd,
    expiryDate: dateGood,
    supplier: 'PharmaLife',
    unitPrice: 8.75,
    reorderLevel: 50
  },
  {
    id: 'p5',
    name: 'Cough Syrup',
    categoryId: 'c3',
    sku: 'MED-002',
    barcode: '8901030054321',
    batchNumber: 'M-5002',
    quantity: 5, // low stock
    manufacturingDate: dateMfd,
    expiryDate: dateExpiringSoon,
    supplier: 'PharmaLife',
    unitPrice: 12.00,
    reorderLevel: 15
  },
  {
    id: 'p6',
    name: 'Canned Beans',
    categoryId: 'c4',
    sku: 'CAN-001',
    barcode: '8901004000063',
    batchNumber: 'C-3001',
    quantity: 300,
    manufacturingDate: dateMfd,
    expiryDate: dateGood,
    supplier: 'PreserveFoods',
    unitPrice: 1.80,
    reorderLevel: 100
  },
  {
    id: 'p7',
    name: 'Orange Juice 2L',
    categoryId: 'c5',
    sku: 'BEV-001',
    barcode: '8901005000070',
    batchNumber: 'J-4001',
    quantity: 60,
    manufacturingDate: dateMfd,
    expiryDate: dateExpiringCritical,
    supplier: 'FreshSqueeze',
    unitPrice: 5.50,
    reorderLevel: 30
  },
  {
    id: 'p8',
    name: 'Fresh Spinach',
    categoryId: 'c6',
    sku: 'PRO-001',
    barcode: '8901006000087',
    batchNumber: 'V-6001',
    quantity: 25,
    manufacturingDate: dateMfd,
    expiryDate: dateExpired,
    supplier: 'Local Farm',
    unitPrice: 2.20,
    reorderLevel: 10
  },
  {
    id: 'p9',
    name: 'Moisturizing Lotion',
    categoryId: 'c7',
    sku: 'COS-001',
    barcode: '8901007000094',
    batchNumber: 'B-7001',
    quantity: 85,
    manufacturingDate: dateMfd,
    expiryDate: dateExpiringSoon,
    supplier: 'BeautyBrands',
    unitPrice: 15.00,
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
