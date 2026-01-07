export const formatPrice = (price: number, currency: string = '₦'): string => {
    return `${currency}${price.toLocaleString()}`
}

export const formatPriceWithPeriod = (
    price: number,
    period?: 'month' | 'year' | 'day',
    currency: string = '₦'
): string => {
    const formattedPrice = formatPrice(price, currency)
    if (!period) return formattedPrice

    const periodMap = {
        month: '/mo',
        year: '/yr',
        day: '/day'
    }
    return `${formattedPrice}${periodMap[period]}`
}

export const formatDate = (date: Date | string): string => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

export const truncate = (str: string, length: number): string => {
    if (str.length <= length) return str
    return str.slice(0, length) + '...'
}
