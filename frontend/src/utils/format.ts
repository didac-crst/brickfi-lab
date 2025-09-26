import Decimal from "decimal.js-light";

type Locale = "de-DE" | "fr-FR" | "en-US";
const DEFAULT_LOCALE: Locale = "fr-FR"; // Using French locale for EUR formatting
const DEFAULT_CURRENCY = "EUR";

// Reuse singletons; creating Intl.NumberFormat repeatedly is expensive.
const nfCache = new Map<string, Intl.NumberFormat>();
function nf(locale: Locale, opts: Intl.NumberFormatOptions) {
  const key = JSON.stringify([locale, opts]);
  if (!nfCache.has(key)) nfCache.set(key, new Intl.NumberFormat(locale, opts));
  return nfCache.get(key)!;
}

// Hard rounding (no FP noise)
export function round(value: number | string, dp = 2): number {
  return new Decimal(value).toDecimalPlaces(dp, Decimal.ROUND_HALF_UP).toNumber();
}

export function formatCurrency(
  value: number | string,
  { locale = DEFAULT_LOCALE, currency = DEFAULT_CURRENCY, dp = 2 }: { locale?: Locale; currency?: string; dp?: number } = {}
): string {
  const v = round(value, dp);
  return nf(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
    currencyDisplay: "narrowSymbol",
  }).format(v);
}

export function formatPercent(
  fraction: number | string, // 0.07 => 7%
  { locale = DEFAULT_LOCALE, dp = 1 }: { locale?: Locale; dp?: number } = {}
): string {
  const pct = new Decimal(fraction).times(100);
  const v = pct.toDecimalPlaces(dp, Decimal.ROUND_HALF_UP).toNumber();
  return nf(locale, { style: "percent", minimumFractionDigits: dp, maximumFractionDigits: dp }).format(v / 100);
}

export function formatNumber(
  value: number | string,
  { locale = DEFAULT_LOCALE, dp = 0 }: { locale?: Locale; dp?: number } = {}
): string {
  const v = round(value, dp);
  return nf(locale, { minimumFractionDigits: dp, maximumFractionDigits: dp }).format(v);
}

// Utility functions for canonical units
export function eurosToCents(euros: number): number {
  return new Decimal(euros).times(100).toNumber();
}

export function centsToEuros(cents: number): number {
  return new Decimal(cents).div(100).toNumber();
}

export function fractionToBasisPoints(fraction: number): number {
  return new Decimal(fraction).times(10000).toNumber();
}

export function basisPointsToFraction(bps: number): number {
  return new Decimal(bps).div(10000).toNumber();
}

// Input normalization utilities
export function normalizeInput(s: string): string {
  // Accept "1 234,56" or "1,234.56"; keep digits and separators
  let t = s.replace(/\s/g, "");
  // If locale uses comma, map comma to dot for Decimal parsing
  // Accept both "," and "."; prefer dot for internal parse
  t = t.replace(",", ".");
  // Drop everything except digits, dot, minus
  t = t.replace(/[^0-9.-]/g, "");
  return t;
}

export function parseToNumber(s: string): number | null {
  if (!s) return null;
  try {
    const d = new Decimal(s);
    const num = d.toNumber();
    // Check if the resulting number is finite
    if (!isFinite(num)) return null;
    return num;
  } catch {
    return null;
  }
}
