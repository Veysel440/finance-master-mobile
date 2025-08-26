export function buildLocalDateTimeISO(localDate: Date, localTime: Date): string {
    const dt = new Date(
        localDate.getFullYear(),
        localDate.getMonth(),
        localDate.getDate(),
        localTime.getHours(),
        localTime.getMinutes(),
        0,
        0
    );
    return dt.toISOString();
}

export function format(isoOrDate: string | Date, locale = "tr-TR") {
    const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
    return new Intl.DateTimeFormat(locale, {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit"
    }).format(d);
}