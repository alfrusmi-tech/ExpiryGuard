import React from 'react';
import { useInventory } from '../hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Package, AlertTriangle, AlertCircle, ShoppingCart } from 'lucide-react';
import { formatDate } from '../utils/expiryUtils';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { stats, alerts, products, loading, error, refreshData } = useInventory();


  // 1. Show loading animation only while data is loading
  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="h-32 bg-slate-200 rounded-xl"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Display API errors with a retry button
  if (error) {
    return (
      <div role="alert" className="p-6 rounded-xl border border-red-200">
        <h2 className="font-semibold text-red-700">
          Unable to load dashboard
        </h2>
        <p className="text-sm mt-2">{error}</p>
        <button
          type="button"
          onClick={() => void refreshData()}
          className="mt-3 text-emerald-700 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  // 3. Handle missing dashboard statistics
  if (!stats) {
    return (
      <div className="p-6 text-center text-slate-600">
        <p>Dashboard statistics are unavailable.</p>
        <button
          type="button"
          onClick={() => void refreshData()}
          className="mt-3 text-emerald-700 underline"
        >
          Try Again
        </button>
      </div>
    );
  }


  const recentActivity = products
  .filter(product => product.quantity > 0)
  .sort((a, b) =>
    a.expiryDate.localeCompare(b.expiryDate)
  )
  .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back. Here's what's happening with your pharmacy inventory today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200/80 shadow-2xs">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Products</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.totalProducts}</h3>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700 border border-emerald-100">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200/80 shadow-2xs">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Items in Stock</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.totalItems}</h3>
              </div>
              <div className="p-3 bg-teal-50 rounded-xl text-teal-700 border border-teal-100">
                <ShoppingCart className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-2xs">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Expiring Soon</p>
                <h3 className="text-3xl font-bold text-amber-600 mt-2">{stats.expiringSoon}</h3>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-2xs">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Expired</p>
                <h3 className="text-3xl font-bold text-red-600 mt-2">{stats.expiredProducts}</h3>
              </div>
              <div className="p-3 bg-red-50 rounded-xl text-red-600 border border-red-100">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Urgent Alerts */}
        <Card className="lg:col-span-2 border-slate-200/80 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Next to Expire</CardTitle>
            <Link to="/inventory" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">View All</Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 font-medium">Product</th>
                    <th className="px-6 py-3 font-medium">Batch</th>
                    <th className="px-6 py-3 font-medium">Quantity</th>
                    <th className="px-6 py-3 font-medium">Expiry Date</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentActivity.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                      <td className="px-6 py-4">{product.batchNumber}</td>
                      <td className="px-6 py-4">{product.quantity}</td>
                      <td className="px-6 py-4">{formatDate(product.expiryDate)}</td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          product.status === 'expired' ? 'danger' : 
                          product.status === 'expiring_soon' ? 'warning' : 'success'
                        }>
                          {product.status === 'expired' ? 'Expired' : 
                           product.status === 'expiring_soon' ? 'Expiring Soon' : 'Good'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Alerts Summary */}
        <Card className="border-slate-200/80 shadow-2xs">
          <CardHeader>
            <CardTitle>Urgent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="flex items-start space-x-3">
                  <div className={`mt-0.5 p-1.5 rounded-full ${
                    alert.type === 'expired' ? 'bg-red-100 text-red-600' :
                    alert.type === 'expiring_soon' ? 'bg-amber-100 text-amber-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {alert.type === 'expired' ? <AlertCircle className="w-4 h-4" /> : 
                     <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{alert.message}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{formatDate(alert.date)}</p>
                  </div>
                </div>
              ))}
              
              {alerts.length === 0 && (
                <div className="text-center py-6 text-slate-500">
                  <span className="text-2xl block mb-2">🎉</span>
                  <p className="text-sm">No urgent alerts. Everything looks good!</p>
                </div>
              )}
            </div>
            
            {alerts.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link to="/alerts" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 w-full flex justify-center">
                  View All {alerts.length} Alerts
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
