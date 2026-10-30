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

/**
 * Keystead quotes rent per year. Listings carry their own price unit, so a monthly price is
 * annualised for display; nightly (short-let) and total (sale) prices keep their own unit.
 * The stored price is never changed here.
 */
export function listingPrice(price: number, priceUnit?: string | null): { amount: number; suffix: string } {
    switch (priceUnit) {
        case 'PER_MONTH':
            return { amount: price * 12, suffix: ' / year' };
        case 'PER_YEAR':
            return { amount: price, suffix: ' / year' };
        case 'PER_NIGHT':
            return { amount: price, suffix: ' / night' };
        default:
            return { amount: price, suffix: '' };
    }
}

/** ₦3,000,000 / year — a listing price formatted with its unit */
export function formatListingPrice(price: number, priceUnit?: string | null, currency: string = DEFAULT_CURRENCY): string {
    const { amount, suffix } = listingPrice(price, priceUnit);
    return formatCurrency(amount, currency) + suffix;
}

/** Leases store monthlyRent; Keystead shows the yearly figure */
export function yearlyRent(monthlyRent: number | null | undefined): number {
    return (monthlyRent ?? 0) * 12;
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
