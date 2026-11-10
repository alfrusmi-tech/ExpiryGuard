
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { useInventory } from '../hooks/useInventory';
import type { Product } from '../types';

import {
  Card,
  CardContent
} from '../components/common/Card';

import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

import { StockMovementDialog } from
  '../components/inventory/StockMovementDialog';

import {
  Search,
  Plus,
  Package,
  ScanLine,
  Barcode,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

import { formatDate } from '../utils/expiryUtils';

export function Inventory() {

  // =========================================
  // 1. Load PostgreSQL inventory data
  // =========================================

  const {
    products,
    categories,
    loading,
    error,
    refreshData
  } = useInventory();

  // =========================================
  // 2. Search and filters
  // =========================================


const [searchParams] = useSearchParams();

// Read search query from the header
const headerSearch = searchParams.get('search') ?? '';

const [searchTerm, setSearchTerm] = useState(headerSearch);
const [statusFilter, setStatusFilter] = useState('');
const [categoryFilter, setCategoryFilter] = useState('');

// Update inventory search when header query changes
useEffect(() => {
  setSearchTerm(headerSearch);
}, [headerSearch]);

const linkedBatchId = searchParams.get('batchId');
const linkedProductId = searchParams.get('productId');


  // =========================================
  // 3. Stock management dialog
  // =========================================

  const [selectedBatch, setSelectedBatch] =
    useState<Product | null>(null);

  const [successMessage, setSuccessMessage] =
    useState('');

  const handleStockSaved = () => {
    setSelectedBatch(null);

    setSuccessMessage(
      'Stock movement recorded successfully!'
    );

    void refreshData();
  };

  // =========================================
  // 4. Filter inventory records
  // =========================================

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return products.filter((product) => {

      const matchesSearch =
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        (product.barcode ?? '').toLowerCase().includes(term) ||
        product.batchNumber.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === '' ||
        product.status === statusFilter;

      const matchesCategory =
        categoryFilter === '' ||
        product.categoryId === categoryFilter;

      const matchesAlertLink = linkedBatchId
        ? product.id === linkedBatchId
        : linkedProductId
          ? (product.productId ?? product.id) === linkedProductId
          : true;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesAlertLink
      );
    });

  }, [
    products,
    searchTerm,
    statusFilter,
    categoryFilter,
    linkedBatchId,
    linkedProductId
  ]);

  // =========================================
  // 5. Inventory summary statistics
  // =========================================

  const totalBatches = products.length;

  const totalStockUnits = products.reduce(
    (total, product) => total + product.quantity,
    0
  );

  const expiredBatches = products.filter(
    (product) =>
      product.status === 'expired' &&
      product.quantity > 0
  ).length;

  // Low-stock checking uses total available
  // stock per product, not individual batch stock.

  const availableStockByProduct = useMemo(() => {

    const totals = new Map<string, number>();

    for (const batch of products) {

      // Expired stock is not saleable stock.
      if (batch.status === 'expired') {
        continue;
      }

      const productId = batch.productId ?? batch.id;

      totals.set(
        productId,
        (totals.get(productId) ?? 0) + batch.quantity
      );
    }

    return totals;

  }, [products]);

  // =========================================
  // 6. Loading screen
  // =========================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse h-12 bg-slate-200 rounded-xl" />
        <div className="animate-pulse h-96 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  // =========================================
  // 7. API error screen
  // =========================================

  if (error) {
    return (
      <div
        role="alert"
        className="bg-red-50 border border-red-200 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle className="w-6 h-6 text-red-600" />

          <h2 className="text-lg font-semibold text-red-800">
            Failed to Load Inventory
          </h2>
        </div>

        <p className="text-red-700 mb-4">
          {error}
        </p>

        <Button
          type="button"
          onClick={() => void refreshData()}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // =========================================
  // 8. Main Inventory page
  // =========================================

  return (
    <div className="space-y-6">

      {/* ===================================
          PAGE HEADER
      =================================== */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Medicine & Product Inventory
          </h1>

          <p className="text-slate-500 text-sm mt-1">
            View, search, and manage medicine batches,
            stock levels, and expiry dates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          {/* Refresh Inventory */}

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSuccessMessage('');
              void refreshData();
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          {/* Scan Product */}

          <Link
            to="/scan-product"
            className="inline-flex h-10 items-center justify-center rounded-md border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 shadow-sm"
          >
            <ScanLine className="w-4 h-4 mr-2" />
            Scan Product
          </Link>

          {/* Add Medicine */}

          <Link
            to="/add-product"
            className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Manually
          </Link>

        </div>
      </div>

      {/* ===================================
          SUCCESS MESSAGE
      =================================== */}

      {successMessage && (
        <div
          role="status"
          className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />

            <span className="text-sm font-medium">
              {successMessage}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            className="text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ===================================
          INVENTORY SUMMARY
      =================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Total Batches */}

        <Card className="p-4">
          <p className="text-sm text-slate-500">
            Total Batches
          </p>

          <p className="text-2xl font-bold text-slate-900 mt-1">
            {totalBatches}
          </p>
        </Card>

        {/* Total Stock Units */}

        <Card className="p-4">
          <p className="text-sm text-slate-500">
            Total Stock Units
          </p>

          <p className="text-2xl font-bold text-slate-900 mt-1">
            {totalStockUnits}
          </p>
        </Card>

        {/* Expired Batches */}

        <Card className="p-4">
          <p className="text-sm text-slate-500">
            Expired Batches With Stock
          </p>

          <p className="text-2xl font-bold text-red-600 mt-1">
            {expiredBatches}
          </p>
        </Card>

      </div>

      {/* ===================================
          ALERT LINK FILTER
      =================================== */}

      {(linkedBatchId || linkedProductId) && (
        <div className="flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200 p-3">

          <p className="text-sm text-amber-800">
            Showing inventory related to the selected alert.
          </p>

          <Link
            to="/inventory"
            className="text-sm text-emerald-700 underline font-medium"
          >
            Clear Alert Filter
          </Link>

        </div>
      )}

      {/* ===================================
          INVENTORY TABLE
      =================================== */}

      <Card className="border-slate-200/80 shadow-sm">

        {/* Search and Filters */}

        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-slate-50/70">

          {/* Search Input */}

          <div className="relative flex-1">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type="text"
              aria-label="Search inventory"
              placeholder="Search medicines, SKU, barcode, or batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />

          </div>

          {/* Filter Selects */}

          <div className="flex flex-col sm:flex-row gap-4">

            {/* Category Filter */}

            <div className="w-full sm:w-48">

              <select
                aria-label="Filter by category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">
                  All Categories
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

            </div>

            {/* Status Filter */}

            <div className="w-full sm:w-48">

              <select
                aria-label="Filter by expiry status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">
                  All Statuses
                </option>

                <option value="good">
                  Good
                </option>

                <option value="expiring_soon">
                  Expiring Soon
                </option>

                <option value="expired">
                  Expired
                </option>
              </select>

            </div>

          </div>
        </div>

        {/* Table Content */}

        <CardContent className="p-0">

          <div className="overflow-x-auto">

            <table className="w-full text-sm text-left text-slate-500">

              {/* Table Header */}

              <thead className="text-xs text-slate-700 bg-slate-50 border-b border-slate-200 uppercase">

                <tr>
                  <th className="px-6 py-4 font-semibold">
                    Product Name
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    SKU / Barcode
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Category
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Qty
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Expiry Date
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-4 font-semibold text-right">
                    Actions
                  </th>
                </tr>

              </thead>

              {/* ===================================
                  TABLE BODY
              =================================== */}

              <tbody className="divide-y divide-slate-100">

                {filteredProducts.map((product) => {

                  // Find category name
                  const category =
                    categories.find(
                      (c) => c.id === product.categoryId
                    )?.name ?? 'Unknown';

                  // Total non-expired stock for this product
                  const productId =
                    product.productId ?? product.id;

                  const availableStock =
                    availableStockByProduct.get(productId) ?? 0;

                  const isLowStock =
                    availableStock <= product.reorderLevel;

                  const status = product.status;

                  const statusVariant =
                    status === 'expired'
                      ? 'danger'
                      : status === 'expiring_soon'
                        ? 'warning'
                        : status === 'good'
                          ? 'success'
                          : 'default';

                  const statusLabel =
                    status === 'expired'
                      ? 'Expired'
                      : status === 'expiring_soon'
                        ? 'Expiring Soon'
                        : status === 'good'
                          ? 'Good'
                          : 'Unknown';

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >

                      {/* Product Name */}

                      <td className="px-6 py-4 font-medium text-slate-900">

                        <div>
                          <span>
                            {product.name}
                          </span>

                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 font-normal mt-0.5">

                            <span>
                              Batch: {product.batchNumber}
                            </span>

                            {product.unitPrice != null && (
                              <span>
                                • Unit price: {Number(product.unitPrice).toFixed(2)}
                              </span>
                            )}

                          </div>
                        </div>

                      </td>

                      {/* SKU and Barcode */}

                      <td className="px-6 py-4 text-slate-500">

                        <div>
                          <span className="font-mono text-xs">
                            {product.sku}
                          </span>

                          {product.barcode && (
                            <div className="flex items-center text-[11px] text-emerald-700 font-mono mt-0.5">

                              <Barcode className="w-3 h-3 mr-1" />

                              {product.barcode}

                            </div>
                          )}
                        </div>

                      </td>

                      {/* Category */}

                      <td className="px-6 py-4">

                        <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium">

                          {category}

                        </span>
                      </td>

                      {/* Quantity */}

                      <td className="px-6 py-4">

                        <span
                          className={
                            isLowStock
                              ? 'text-red-600 font-semibold'
                              : 'text-slate-700 font-medium'
                          }
                        >
                          {product.quantity}
                        </span>

                      </td>

                      {/* Expiry Date */}

                      <td className="px-6 py-4">
                        {formatDate(product.expiryDate)}
                      </td>

                      {/* Expiry Status */}

                      <td className="px-6 py-4">

                        <Badge variant={statusVariant}>
                          {statusLabel}
                        </Badge>

                      </td>

                      {/* Manage Stock */}

                      <td className="px-6 py-4 text-right">

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSuccessMessage('');
                            setSelectedBatch(product);
                          }}
                        >
                          Manage Stock
                        </Button>

                      </td>

                    </tr>
                  );
                })}

                {/* ===================================
                    EMPTY INVENTORY
                =================================== */}

                {filteredProducts.length === 0 && (
                  <tr>

                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-slate-500"
                    >

                      <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />

                      <p className="text-lg font-medium text-slate-900">
                        No products found
                      </p>

                      <p className="text-sm mt-1">
                        Try adjusting your filters or add
                        a new medicine to your inventory.
                      </p>

                    </td>

                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </CardContent>

      </Card>

      {/* ===================================
          STOCK MANAGEMENT DIALOG
      =================================== */}

      {selectedBatch && (
        <StockMovementDialog
          batch={selectedBatch}
          onClose={() => {
            setSelectedBatch(null);
          }}
          onSaved={handleStockSaved}
        />
      )}

    </div>
  );
}
