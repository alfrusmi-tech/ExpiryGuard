
import { useState } from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../components/common/Card';

import { Button } from '../components/common/Button';
import {
  Download,
  FileText,
  BarChart3,
  Trash2
} from 'lucide-react';

import { useInventory } from '../hooks/useInventory';

type ReportType =
  | 'inventory'
  | 'disposals'
  | 'expiry';

const filenames: Record<ReportType, string> = {
  inventory: 'inventory-report.csv',
  disposals: 'disposal-report.csv',
  expiry: 'expiry-report.csv'
};

export function Reports() {
  const { stats, loading } = useInventory();

  const [downloading, setDownloading] =
    useState<ReportType | null>(null);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function downloadReport(type: ReportType) {
    setError('');
    setMessage('');
    setDownloading(type);

    try {
      const response = await fetch(
        `/api/reports/${type}.csv`,
        { credentials: 'same-origin' }
      );

      if (response.status === 401) {
        throw new Error('Please log in again');
      }

      if (response.status === 403) {
        throw new Error(
          'Only administrators can export reports'
        );
      }

      if (!response.ok) {
        throw new Error(
          `Report generation failed: HTTP ${response.status}`
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filenames[type];

      document.body.appendChild(link);
      link.click();
      link.remove();

      // Allow the browser time to start the download.
      window.setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 30000);

      setMessage(
        'Report generated. Check your browser downloads.'
      );

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to generate report'
      );
    } finally {
      setDownloading(null);
    }
  }

  if (loading) {
    return <p>Loading reports...</p>;
  }

  const reports = [
    {
      type: 'inventory' as const,
      title: 'Inventory Summary',
      description:
        'Export current medicines, batches, stock quantities and expiry dates.',
      value: stats?.totalItems ?? 0,
      label: 'Total Units',
      Icon: FileText
    },
    {
      type: 'disposals' as const,
      title: 'Waste & Disposal History',
      description:
        'Export recorded disposal transactions and their quantities.',
      value: null,
      label: '',
      Icon: Trash2
    },
    {
      type: 'expiry' as const,
      title: 'Expiry Projection',
      description:
        'Export batches expiring in the next 30, 60 and 90 days.',
      value: stats?.expiringSoon ?? 0,
      label: 'Expiring Soon (Settings Window)',
      Icon: BarChart3
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Reports & Analytics
        </h1>
        <p className="text-slate-500 mt-1">
          Download reports generated from PostgreSQL data.
        </p>
      </div>

      {error && (
        <p role="alert"
           className="p-3 bg-red-50 text-red-700 rounded-lg">
          {error}
        </p>
      )}

      {message && (
        <p role="status"
           className="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
          {message}
        </p>
      )}

      <Button
        variant="outline"
        disabled={downloading !== null}
        onClick={() => void downloadReport('inventory')}
      >
        <Download className="w-4 h-4 mr-2" />
        Export Inventory CSV
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map(report => {
          const Icon = report.Icon;

          return (
            <Card key={report.type}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-emerald-600" />
                  {report.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-slate-500">
                  {report.description}
                </p>

                {report.value !== null && (
                  <p className="text-xl font-bold">
                    {report.value}
                    <span className="text-xs font-normal ml-2">
                      {report.label}
                    </span>
                  </p>
                )}

                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={downloading !== null}
                  onClick={() =>
                    void downloadReport(report.type)
                  }
                >
                  {downloading === report.type
                    ? 'Generating...'
                    : 'Download CSV'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
