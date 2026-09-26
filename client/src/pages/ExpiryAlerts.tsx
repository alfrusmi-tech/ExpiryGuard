import React, { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { Card, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { AlertCircle, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../utils/expiryUtils';

export function ExpiryAlerts() {
  const { alerts, loading, products } = useInventory();
  const [filter, setFilter] = useState<'all' | 'expired' | 'expiring_soon' | 'low_stock'>('all');

  if (loading) {
    return <div className="animate-pulse h-96 bg-slate-200 rounded-xl"></div>;
  }

  const filteredAlerts = alerts.filter(a => filter === 'all' || a.type === filter);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'expired': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'expiring_soon': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'low_stock': return <AlertTriangle className="w-5 h-5 text-indigo-600" />;
      default: return <Clock className="w-5 h-5 text-slate-600" />;
    }
  };

  const getAlertBg = (type: string) => {
    switch (type) {
      case 'expired': return 'bg-red-50 border-red-100';
      case 'expiring_soon': return 'bg-amber-50 border-amber-100';
      case 'low_stock': return 'bg-indigo-50 border-indigo-100';
      default: return 'bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Expiry & Stock Alerts</h1>
        <p className="text-slate-500">Action items requiring your immediate attention.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'expired', label: 'Expired' },
          { id: 'expiring_soon', label: 'Expiring Soon' },
          { id: 'low_stock', label: 'Low Stock' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              filter === tab.id 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {tab.label}
            {tab.id !== 'all' && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                {alerts.filter(a => a.type === tab.id).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">All Clear!</h3>
              <p className="text-slate-500 max-w-sm mt-1">
                You have no active alerts in this category. Your inventory is looking great.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map(alert => {
            const product = products.find(p => p.id === alert.productId);
            return (
              <div 
                key={alert.id} 
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-shadow hover:shadow-sm ${getAlertBg(alert.type)}`}
              >
                <div className="flex items-start sm:items-center space-x-4">
                  <div className="shrink-0 p-2 bg-white rounded-full shadow-sm">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">{alert.message}</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Detected on {formatDate(alert.date)} • {product?.batchNumber ? `Batch: ${product.batchNumber}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 shrink-0 pl-14 sm:pl-0">
                  <button className="px-3 py-1.5 text-sm font-medium bg-white border border-slate-300 rounded hover:bg-slate-50 text-slate-700 transition-colors">
                    View Details
                  </button>
                  <button className="px-3 py-1.5 text-sm font-medium bg-blue-600 border border-transparent rounded hover:bg-blue-700 text-white transition-colors">
                    Mark Resolved
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
