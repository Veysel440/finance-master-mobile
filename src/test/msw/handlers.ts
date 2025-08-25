import { http, HttpResponse } from "msw";

export const handlers = [
    http.get("*/health", () => HttpResponse.text("ok")),
    http.get("*/v1/transactions", ({ request }) => {
        const url = new URL(request.url);
        const q = url.searchParams.get("q") || "";
        return HttpResponse.json({ total: 1, data: [{ id: 1, type: "expense", amount: 10, currency: "TRY", categoryId: 1, walletId: 1, note: q, occurredAt: new Date().toISOString() }] });
    }),
];