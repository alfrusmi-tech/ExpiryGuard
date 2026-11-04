import React, { useState } from 'react';
import { Card, CardContent } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Save, CheckCircle2 } from 'lucide-react';

export function Settings() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-slate-500">Configure ExpiryGuard pharmacy preferences and alerts.</p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium text-slate-900">Alert Thresholds</h3>
            <p className="text-sm text-slate-500 mt-1">Configure when the system should warn you about expiring medicine batches.</p>
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
                    defaultValue="15"
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
            <p className="text-sm text-slate-500 mt-1">Manage how the pharmacy receives alerts.</p>
          </div>
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" defaultChecked />
                    <span className="text-sm font-medium text-slate-700">Daily Pharmacy Expiry Summary Email</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" defaultChecked />
                    <span className="text-sm font-medium text-slate-700">Instant Alert for Expired Medicines</span>
                  </label>
                  <Input 
                    label="Pharmacist Notification Email Address" 
                    type="email" 
                    defaultValue="pharmacist@expiryguard.local"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
