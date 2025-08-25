export const fmtMoney = (v: number, cur: string, locale?: string) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: cur, maximumFractionDigits: 2 }).format(v);

export const fmtDate = (iso: string, locale?: string) =>
    new Intl.DateTimeFormat(locale ?? undefined, { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));