/**
 * Formatting utilities for consistent rendering across server and client
 * to avoid hydration errors in SSR applications.
 */

/**
 * Format a date string consistently using UTC to avoid hydration mismatches.
 * This ensures the same output on both server and client regardless of timezone/locale.
 *
 * @param dateString - ISO date string or null/undefined
 * @returns Formatted date string in format: YYYY-MM-DD HH:MM:SS UTC
 *
 * @example
 * formatDate('2025-11-16T06:22:20.000Z') // "2025-11-16 06:22:20 UTC"
 * formatDate(null) // "N/A"
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';

  // Use UTC methods to ensure server/client consistency
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
}

/**
 * Format a date string to show only the date part (no time).
 *
 * @param dateString - ISO date string or null/undefined
 * @returns Formatted date string in format: YYYY-MM-DD
 *
 * @example
 * formatDateOnly('2025-11-16T06:22:20.000Z') // "2025-11-16"
 */
export function formatDateOnly(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Format a date string to show relative time (e.g., "2 hours ago").
 * Falls back to absolute date for dates older than 7 days.
 *
 * @param dateString - ISO date string or null/undefined
 * @returns Formatted relative or absolute date string
 *
 * @example
 * formatRelativeDate(new Date(Date.now() - 3600000).toISOString()) // "1 hour ago"
 * formatRelativeDate(new Date(Date.now() - 86400000 * 10).toISOString()) // "2025-11-06"
 */
export function formatRelativeDate(
  dateString: string | null | undefined,
): string {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // For dates older than 7 days, show absolute date
  if (diffDays > 7) {
    return formatDateOnly(dateString);
  }

  // Recent dates - show relative time
  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
}

/**
 * Format a number with thousand separators for better readability.
 * Consistent across server/client.
 *
 * @param num - Number to format
 * @returns Formatted number string with commas
 *
 * @example
 * formatNumber(1234567) // "1,234,567"
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString('en-US');
}

/**
 * Format currency amount in USD.
 *
 * @param amount - Amount in cents
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(999) // "$9.99"
 * formatCurrency(10000) // "$100.00"
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '$0.00';
  return `$${(amount / 100).toFixed(2)}`;
}

/**
 * Format a percentage value.
 *
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 *
 * @example
 * formatPercentage(67.5) // "67.5%"
 * formatPercentage(67.5432, 2) // "67.54%"
 */
export function formatPercentage(
  value: number | null | undefined,
  decimals = 1,
): string {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(decimals)}%`;
}
