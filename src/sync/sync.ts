import { flushQueue, pullDelta } from "@/features/transactions/service";
import { QueryClient } from "@tanstack/react-query";

let qcRef: QueryClient | null = null;
export function bindQueryClient(qc: QueryClient) { qcRef = qc; }

export async function syncNow() {
    await flushQueue();
    await pullDelta();
    if (qcRef) {
        qcRef.invalidateQueries({ queryKey: ["tx.list"] });
        qcRef.invalidateQueries({ queryKey: ["tx.range"] });
        qcRef.invalidateQueries({ queryKey: ["tx.summary"] });
        qcRef.invalidateQueries({ queryKey: ["tx.one"] });
    }
}