import type { Product, Category, Alert, DashboardStats } from '../types';
import { mockProducts, mockCategories, mockAlerts } from '../data/mockData';
import { getExpiryStatus } from '../utils/expiryUtils';
import { addDays, format } from 'date-fns';

const PRODUCTS_STORAGE_KEY = 'expiryguard_stored_products';
const ALERTS_STORAGE_KEY = 'expiryguard_stored_alerts';

// Common pharmaceutical barcode dictionary for instant demo scanning & lookup
const KNOWN_PHARMA_BARCODES: Record<string, Partial<Product>> = {
  '8901030012345': {
    name: 'Paracetamol 500mg',
    sku: 'MED-001',
    categoryId: 'c3',
    batchNumber: 'M-5001',
    supplier: 'PharmaLife',
    unitPrice: 8.75,
    reorderLevel: 50,
  },
  '8901030054321': {
    name: 'Cough Syrup',
    sku: 'MED-002',
    categoryId: 'c3',
    batchNumber: 'M-5002',
    supplier: 'PharmaLife',
    unitPrice: 12.00,
    reorderLevel: 15,
  },
  '8901030099881': {
    name: 'Amoxicillin 500mg Capsules',
    sku: 'MED-003',
    categoryId: 'c3',
    batchNumber: 'M-5003',
    supplier: 'GlaxoPharma',
    unitPrice: 14.50,
    reorderLevel: 30,
  },
  '8901030077665': {
    name: 'Ibuprofen 400mg Tablets',
    sku: 'MED-004',
    categoryId: 'c3',
    batchNumber: 'M-5004',
    supplier: 'Abbott Healthcare',
    unitPrice: 6.20,
    reorderLevel: 40,
  },
  '8901030044332': {
    name: 'Cetirizine 10mg Antihistamine',
    sku: 'MED-005',
    categoryId: 'c3',
    batchNumber: 'M-5005',
    supplier: 'SunPharma',
    unitPrice: 4.80,
    reorderLevel: 25,
  },
  '8901030022119': {
    name: 'Omeprazole 20mg Capsules',
    sku: 'MED-006',
    categoryId: 'c3',
    batchNumber: 'M-5006',
    supplier: "Dr. Reddy's",
    unitPrice: 11.00,
    reorderLevel: 20,
  },
  '8901030033228': {
    name: 'Azithromycin 500mg Tablets',
    sku: 'MED-007',
    categoryId: 'c3',
    batchNumber: 'M-5007',
    supplier: 'Cipla Healthcare',
    unitPrice: 18.00,
    reorderLevel: 25,
  },
  '8901030088990': {
    name: 'Metformin 500mg Extended Release',
    sku: 'MED-008',
    categoryId: 'c3',
    batchNumber: 'M-5008',
    supplier: 'Lupin Labs',
    unitPrice: 5.50,
    reorderLevel: 50,
  },
  '030045044908': {
    name: 'Tylenol Extra Strength 500mg',
    sku: 'MED-009',
    categoryId: 'c3',
    batchNumber: 'M-5009',
    supplier: 'Johnson & Johnson',
    unitPrice: 10.99,
    reorderLevel: 30,
  },
  '00093226801': {
    name: 'Amoxicillin Trihydrate 500mg',
    sku: 'MED-010',
    categoryId: 'c3',
    batchNumber: 'M-5010',
    supplier: 'Teva Pharmaceuticals',
    unitPrice: 15.20,
    reorderLevel: 35,
  },
  '00071015523': {
    name: 'Lipitor 20mg Atorvastatin',
    sku: 'MED-011',
    categoryId: 'c3',
    batchNumber: 'M-5011',
    supplier: 'Pfizer Inc',
    unitPrice: 22.50,
    reorderLevel: 25,
  },
};

function getStoredProducts(): Product[] {
  try {
    const raw = sessionStorage.getItem(PRODUCTS_STORAGE_KEY) || localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Product[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(p => ({
          ...p,
          status: getExpiryStatus(p.expiryDate)
        }));
      }
    }
  } catch (e) {
    console.warn('Error reading stored products:', e);
  }
  return [...mockProducts];
}

function saveStoredProducts(products: Product[]) {
  try {
    const data = JSON.stringify(products);
    sessionStorage.setItem(PRODUCTS_STORAGE_KEY, data);
    localStorage.setItem(PRODUCTS_STORAGE_KEY, data);
    window.dispatchEvent(new Event('expiryguard-inventory-updated'));
  } catch (e) {
    console.warn('Error saving products:', e);
  }
}

function getStoredAlerts(currentProducts: Product[]): Alert[] {
  try {
    const raw = sessionStorage.getItem(ALERTS_STORAGE_KEY) || localStorage.getItem(ALERTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Alert[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored alerts:', e);
  }

  // Derive dynamic alerts from current product statuses
  const today = format(new Date(), 'yyyy-MM-dd');
  return currentProducts
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
        date: today,
        resolved: false
      };
    });
}

function saveStoredAlerts(alerts: Alert[]) {
  try {
    const data = JSON.stringify(alerts);
    sessionStorage.setItem(ALERTS_STORAGE_KEY, data);
    localStorage.setItem(ALERTS_STORAGE_KEY, data);
  } catch (e) {
    console.warn('Error saving alerts:', e);
  }
}

export const inventoryService = {
  getProducts: async (): Promise<Product[]> => {
    return getStoredProducts();
  },

  getCategories: async (): Promise<Category[]> => {
    const products = getStoredProducts();
    // Update category item count dynamically
    return mockCategories.map(cat => ({
      ...cat,
      itemCount: products.filter(p => p.categoryId === cat.id).length
    }));
  },

  getAlerts: async (): Promise<Alert[]> => {
    const products = getStoredProducts();
    return getStoredAlerts(products);
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const products = getStoredProducts();

    return {
      totalProducts: products.length,
      totalItems: products.reduce((sum, p) => sum + p.quantity, 0),
      expiringSoon: products.filter(p => p.status === 'expiring_soon').length,
      expiredProducts: products.filter(p => p.status === 'expired').length,
      lowStock: products.filter(p => p.quantity <= p.reorderLevel).length,
    };
  },

  addProduct: async (newProduct: Omit<Product, 'id'> | Product): Promise<Product> => {
    const products = getStoredProducts();
    const id = ('id' in newProduct && newProduct.id) ? newProduct.id : `p-${Date.now()}`;
    const status = getExpiryStatus(newProduct.expiryDate);

    const productToAdd: Product = {
      ...newProduct,
      id,
      status,
      quantity: Number(newProduct.quantity) || 0,
      unitPrice: newProduct.unitPrice !== undefined ? Number(newProduct.unitPrice) : undefined,
      reorderLevel: Number(newProduct.reorderLevel) || 10,
    };

    // Check if product with same ID already exists, otherwise prepend
    const existingIndex = products.findIndex(p => p.id === id);
    let updatedProducts: Product[];

    if (existingIndex >= 0) {
      updatedProducts = [...products];
      updatedProducts[existingIndex] = productToAdd;
    } else {
      updatedProducts = [productToAdd, ...products];
    }

    saveStoredProducts(updatedProducts);

    // Update alerts if needed
    const alerts = getStoredAlerts(updatedProducts);
    if (status !== 'good' || productToAdd.quantity <= productToAdd.reorderLevel) {
      const today = format(new Date(), 'yyyy-MM-dd');
      let type: Alert['type'] = 'expiring_soon';
      let message = `${productToAdd.name} is expiring soon.`;

      if (status === 'expired') {
        type = 'expired';
        message = `${productToAdd.name} has expired!`;
      } else if (productToAdd.quantity <= productToAdd.reorderLevel) {
        type = 'low_stock';
        message = `${productToAdd.name} is running low (${productToAdd.quantity} left).`;
      }

      const newAlert: Alert = {
        id: `a-${id}`,
        productId: id,
        type,
        message,
        date: today,
        resolved: false
      };

      const alertIndex = alerts.findIndex(a => a.productId === id);
      if (alertIndex >= 0) {
        alerts[alertIndex] = newAlert;
      } else {
        alerts.unshift(newAlert);
      }
      saveStoredAlerts(alerts);
    }

    return productToAdd;
  },

  findProductByCode: async (code: string): Promise<Product | null> => {
    if (!code || !code.trim()) return null;
    const cleanCode = code.trim();
    const products = getStoredProducts();

    // 1. Check if the scanned string is structured JSON
    if (cleanCode.startsWith('{') && cleanCode.endsWith('}')) {
      try {
        const parsed = JSON.parse(cleanCode);
        if (parsed.name) {
          const defaultExpiry = format(addDays(new Date(), 180), 'yyyy-MM-dd');
          return {
            id: `p-scanned-${Date.now()}`,
            name: String(parsed.name),
            categoryId: String(parsed.categoryId || 'c3'),
            sku: String(parsed.sku || `SKU-${cleanCode.substring(0, 6)}`),
            barcode: String(parsed.barcode || cleanCode),
            batchNumber: String(parsed.batchNumber || `LOT-${Date.now().toString().slice(-4)}`),
            quantity: Number(parsed.quantity) || 50,
            manufacturingDate: parsed.manufacturingDate ? String(parsed.manufacturingDate) : undefined,
            expiryDate: String(parsed.expiryDate || defaultExpiry),
            supplier: String(parsed.supplier || 'Pharma Supplier'),
            unitPrice: parsed.unitPrice ? Number(parsed.unitPrice) : undefined,
            reorderLevel: Number(parsed.reorderLevel) || 15,
            status: getExpiryStatus(parsed.expiryDate || defaultExpiry)
          };
        }
      } catch (e) {
        // Not valid JSON, continue with standard barcode matching
      }
    }

    // 2. Exact match in current inventory (by barcode, sku, batchNumber, or id)
    const matched = products.find(p => 
      (p.barcode && p.barcode.toLowerCase() === cleanCode.toLowerCase()) ||
      p.sku.toLowerCase() === cleanCode.toLowerCase() ||
      p.batchNumber.toLowerCase() === cleanCode.toLowerCase() ||
      p.id.toLowerCase() === cleanCode.toLowerCase()
    );

    if (matched) {
      return { ...matched };
    }

    // 3. Match against known pharmaceutical barcode database
    const knownPharma = KNOWN_PHARMA_BARCODES[cleanCode];
    if (knownPharma && knownPharma.name) {
      const defaultExpiry = format(addDays(new Date(), 365), 'yyyy-MM-dd');
      const defaultMfd = format(addDays(new Date(), -60), 'yyyy-MM-dd');
      return {
        id: `p-scanned-${Date.now()}`,
        name: knownPharma.name,
        categoryId: knownPharma.categoryId || 'c3',
        sku: knownPharma.sku || `SKU-${cleanCode.slice(-6)}`,
        barcode: cleanCode,
        batchNumber: knownPharma.batchNumber || `LOT-${cleanCode.slice(-4)}`,
        quantity: 50,
        manufacturingDate: defaultMfd,
        expiryDate: defaultExpiry,
        supplier: knownPharma.supplier || 'Licensed Pharmaceutical Distributor',
        unitPrice: knownPharma.unitPrice || 10.00,
        reorderLevel: knownPharma.reorderLevel || 15,
        status: 'good'
      };
    }

    return null;
  }
};
