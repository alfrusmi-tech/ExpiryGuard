import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Download, FileText, BarChart, TrendingDown } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';

export function Reports() {
  const { stats, loading } = useInventory();

  if (loading) return <div className="animate-pulse h-96 bg-slate-200 rounded-xl"></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-slate-500">Generate and export insights about your inventory.</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export All Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FileText className="w-5 h-5 mr-2 text-blue-500" />
              Inventory Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">Complete overview of current stock levels, valuations, and category distribution.</p>
            <div className="text-2xl font-bold text-slate-900 mb-4">{stats?.totalItems} <span className="text-sm font-normal text-slate-500">Total Items</span></div>
            <Button variant="secondary" className="w-full">Generate Report</Button>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-red-500">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <TrendingDown className="w-5 h-5 mr-2 text-red-500" />
              Waste & Spoilage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">Historical data on expired products, disposal costs, and high-risk categories.</p>
            <div className="text-2xl font-bold text-slate-900 mb-4">{stats?.expiredProducts} <span className="text-sm font-normal text-slate-500">Expired Items</span></div>
            <Button variant="secondary" className="w-full">Generate Report</Button>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-amber-500">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <BarChart className="w-5 h-5 mr-2 text-amber-500" />
              Expiry Projection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">Forecast of products expiring in the next 30, 60, and 90 days to plan promotions.</p>
            <div className="text-2xl font-bold text-slate-900 mb-4">{stats?.expiringSoon} <span className="text-sm font-normal text-slate-500">Expiring &lt; 30 days</span></div>
            <Button variant="secondary" className="w-full">Generate Report</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
