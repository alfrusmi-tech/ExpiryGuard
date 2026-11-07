
import { apiRequest } from './apiClient';

export interface SystemSettings {
  expiringSoonDays: number;
  criticalExpiryDays: number;
  defaultLowStockThreshold: number;
  dailyEmailEnabled: boolean;
  instantExpiredAlertEnabled: boolean;
  notificationEmail: string;
}

export const settingsService = {
  getSettings(): Promise<SystemSettings> {
    return apiRequest<SystemSettings>('/settings');
  },

  saveSettings(
    settings: SystemSettings
  ): Promise<SystemSettings> {
    return apiRequest<SystemSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }
};
