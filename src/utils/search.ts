export function normalizeSearch(q: string): string {
    const s = (q || "").trim();
    if (!s) return "";
    if (/^ft[:\s]/i.test(s)) return "ft:" + s.replace(/^ft[:\s]+/i, "");
    return s;
}