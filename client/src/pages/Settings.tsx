import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Save } from 'lucide-react';

export function Settings() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-slate-500">Configure ExpiryGuard preferences and alerts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium text-slate-900">Alert Thresholds</h3>
          <p className="text-sm text-slate-500 mt-1">Configure when the system should warn you about expiring products.</p>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Input 
                  label="Expiring Soon Threshold (Days)" 
                  type="number" 
                  defaultValue="30"
                  min="1"
                />
                <Input 
                  label="Critical Expiry Threshold (Days)" 
                  type="number" 
                  defaultValue="7"
                  min="1"
                />
                <Input 
                  label="Default Low Stock Threshold (Units)" 
                  type="number" 
                  defaultValue="10"
                  min="1"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="border-t border-slate-200 my-6"></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium text-slate-900">Notifications</h3>
          <p className="text-sm text-slate-500 mt-1">Manage how you receive alerts.</p>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                  <span className="text-sm font-medium text-slate-700">Daily Summary Email</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                  <span className="text-sm font-medium text-slate-700">Instant Alert for Expired Items</span>
                </label>
                <Input 
                  label="Notification Email Address" 
                  type="email" 
                  defaultValue="admin@expiryguard.local"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
