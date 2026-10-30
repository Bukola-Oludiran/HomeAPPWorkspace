/**
 * Money formatting shared across the app.
 * Keystead shows prices in naira: the backend stores NGN unless a record carries its own
 * currency, so pass `currency` through from the API when it is there.
 */

export const DEFAULT_CURRENCY = 'NGN';

/** ₦1,250,000 — whole naira by default; pass fractionDigits = 2 to show kobo */
export function formatCurrency(
    amount: number | null | undefined,
    currency: string = DEFAULT_CURRENCY,
    fractionDigits: number = 0
): string {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(amount ?? 0);
}

/** ₦1.3M, ₦850K — for tight spaces such as stat tiles and chart labels */
export function formatCompactCurrency(
    amount: number | null | undefined,
    currency: string = DEFAULT_CURRENCY
): string {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency,
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(amount ?? 0);
}
