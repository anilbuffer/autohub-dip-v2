/**
 * Safe number and currency formatters for Next.js SSR hydration consistency.
 *
 * Calling `num.toLocaleString()` without specifying a locale causes hydration
 * mismatches when the server runtime locale (e.g. en-IN on Indian Windows/Linux systems)
 * groups numbers differently (1,10,000) than the client browser (110,000).
 */

export const DEFAULT_LOCALE = "en-US";

export function formatNumber(value: number, locale = DEFAULT_LOCALE): string {
  if (value === null || value === undefined || isNaN(value)) return "0";
  return value.toLocaleString(locale);
}

export function formatKm(kms: number, locale = DEFAULT_LOCALE): string {
  return `${formatNumber(kms, locale)} km`;
}

export function formatNzd(amount: number, locale = DEFAULT_LOCALE): string {
  return `NZ$${formatNumber(amount, locale)}`;
}

export function formatJpy(amount: number, locale = DEFAULT_LOCALE): string {
  return `¥${formatNumber(amount, locale)}`;
}
