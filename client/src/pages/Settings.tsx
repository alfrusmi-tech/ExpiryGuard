
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { Card, CardContent } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

import {
  settingsService,
  type SystemSettings
} from '../services/settingsService';

import { Save } from 'lucide-react';

export function Settings() {
  const [settings, setSettings] =
    useState<SystemSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;

    settingsService.getSettings()
      .then(data => {
        if (active) setSettings(data);
      })
      .catch(err => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load settings'
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function update<K extends keyof SystemSettings>(
    field: K,
    value: SystemSettings[K]
  ) {
    setSettings(current =>
      current ? { ...current, [field]: value } : null
    );

    setSuccess('');
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();

    if (!settings) return;

    setError('');
    setSuccess('');

    if (
      !Number.isInteger(settings.expiringSoonDays) ||
      settings.expiringSoonDays < 1 ||
      settings.expiringSoonDays > 365
    ) {
      setError('Expiring-soon days must be between 1 and 365');
      return;
    }

    if (
      !Number.isInteger(settings.criticalExpiryDays) ||
      settings.criticalExpiryDays < 1 ||
      settings.criticalExpiryDays > settings.expiringSoonDays
    ) {
      setError(
        'Critical days must be at least 1 and ' +
        'not exceed expiring-soon days'
      );
      return;
    }

    if (
      !Number.isInteger(settings.defaultLowStockThreshold) ||
      settings.defaultLowStockThreshold < 1 ||
      settings.defaultLowStockThreshold > 1000000
    ) {
      setError('Invalid low-stock threshold');
      return;
    }

    if (
      settings.dailyEmailEnabled &&
      !settings.notificationEmail.trim()
    ) {
      setError(
        'Enter an email address for daily summaries'
      );
      return;
    }

    setSaving(true);

    try {
      const saved = await settingsService.saveSettings(settings);

      setSettings(saved);
      setSuccess('Settings saved to PostgreSQL successfully');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save settings'
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="p-6">Loading settings...</p>;
  }

  if (!settings) {
    return (
      <div role="alert" className="p-6 text-red-600">
        {error || 'Settings are unavailable'}
        <button
          type="button"
          className="block mt-3 underline"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          System Settings
        </h1>
        <p className="text-slate-500">
          Configure pharmacy preferences and alert thresholds.
        </p>
      </div>

      {error && (
        <p role="alert"
           className="p-3 rounded-lg bg-red-50 text-red-700">
          {error}
        </p>
      )}

      {success && (
        <p role="status"
           className="p-3 rounded-lg bg-emerald-50 text-emerald-700">
          {success}
        </p>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              Alert Thresholds
            </h2>

            <Input
              label="Expiring Soon Threshold (Days)"
              type="number"
              min="1"
              max="365"
              required
              value={settings.expiringSoonDays}
              onChange={e =>
                update('expiringSoonDays', Number(e.target.value))
              }
            />

            <Input
              label="Critical Expiry Threshold (Days)"
              type="number"
              min="1"
              max="365"
              required
              value={settings.criticalExpiryDays}
              onChange={e =>
                update('criticalExpiryDays', Number(e.target.value))
              }
            />

            <Input
              label="Default Low Stock Threshold (Units)"
              type="number"
              min="1"
              required
              value={settings.defaultLowStockThreshold}
              onChange={e =>
                update(
                  'defaultLowStockThreshold',
                  Number(e.target.value)
                )
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              Notification Preferences
            </h2>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.dailyEmailEnabled}
                onChange={e =>
                  update('dailyEmailEnabled', e.target.checked)
                }
              />
              <span>Daily Pharmacy Expiry Summary Email</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.instantExpiredAlertEnabled}
                onChange={e =>
                  update(
                    'instantExpiredAlertEnabled',
                    e.target.checked
                  )
                }
              />
              <span>Expired Medicine Notifications</span>
            </label>

            <Input
              label="Pharmacist Notification Email Address"
              type="email"
              value={settings.notificationEmail}
              onChange={e =>
                update('notificationEmail', e.target.value)
              }
              placeholder="pharmacist@example.com"
            />

            <p className="text-xs text-slate-500">
              Preferences are stored in PostgreSQL.
              Automatic email and notification delivery
              are not implemented yet.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
