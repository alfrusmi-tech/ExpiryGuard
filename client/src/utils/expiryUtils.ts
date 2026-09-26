import { differenceInDays, parseISO, isPast } from 'date-fns';
import { ExpiryStatus } from '../types';

export const EXPIRY_WARNING_DAYS = 30;
export const EXPIRY_CRITICAL_DAYS = 7;

export function getDaysUntilExpiry(expiryDate: string): number {
  const date = parseISO(expiryDate);
  const today = new Date();
  
  if (isPast(date) && date.toDateString() !== today.toDateString()) {
    return differenceInDays(date, today); // will be negative
  }
  
  return differenceInDays(date, today);
}

export function getExpiryStatus(expiryDate: string): ExpiryStatus {
  const daysUntil = getDaysUntilExpiry(expiryDate);
  
  if (daysUntil < 0) {
    return 'expired';
  }
  if (daysUntil <= EXPIRY_WARNING_DAYS) {
    return 'expiring_soon';
  }
  return 'good';
}

export function formatDate(dateString: string): string {
  const date = parseISO(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}
