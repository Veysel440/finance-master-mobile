export function money(v: number, currency: string, locale = undefined) {
    return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 }).format(v);
}
export function dateISO(iso: string, locale = undefined) {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(locale, { year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}
