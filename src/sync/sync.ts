import type { QueryClient } from "@tanstack/react-query";

let qcRef: QueryClient | null = null;
export function bindQueryClient(qc: QueryClient) { qcRef = qc; }

export async function resetOnLogout() {
    if (qcRef) { await qcRef.cancelQueries(); qcRef.clear(); }
    try { const { queue } = await import("@/offline/queue"); await queue.clear(); } catch {}
}

export async function syncNow() {
    const { flushQueue, pullDelta } = await import("@/features/transactions/service");
    await flushQueue();
    await pullDelta();
    if (qcRef) {
        await Promise.all([
            qcRef.invalidateQueries({ queryKey: ["tx.list"] }),
            qcRef.invalidateQueries({ queryKey: ["tx.range"] }),
            qcRef.invalidateQueries({ queryKey: ["tx.summary"] }),
            qcRef.invalidateQueries({ queryKey: ["wallets"] }),
            qcRef.invalidateQueries({ queryKey: ["categories"] }),
        ]);
    }
}
