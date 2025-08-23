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