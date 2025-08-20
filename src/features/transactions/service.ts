import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mysql, Page, TxCreate } from "@/db/mysql";
import { Transaction } from "@/schemas/transaction";
import { queue } from "@/offline/queue";
import { isOnline } from "@/offline/net";

const QK = { list: (q?:string, page?:number)=>["tx.list", q||"", page||1] };

export function useTransactions(params?: { page?: number; q?: string }) {
    return useQuery<Page<Transaction>>({
        queryKey: QK.list(params?.q, params?.page),
        queryFn: () => mysql.listTransactions(params),
    });
}

export function useCreateTransaction() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: TxCreate) => {
            if (await isOnline()) return mysql.createTransaction(payload);

            const offlineId = `offline-${Date.now()}`;
            await queue.push({ id: offlineId, type: "tx.create", payload });
            return { id: offlineId, ...payload } as any as Transaction;
        },
        onMutate: async (payload) => {
            await qc.cancelQueries();
            const k = QK.list("", 1);
            const prev = qc.getQueryData<any>(k);

            qc.setQueryData<any>(k, (old: any) => {
                const data = old?.data ?? [];
                return { total: (old?.total ?? 0) + 1, data: [{ id:`temp-${Date.now()}`, ...payload }, ...data] };
            });
            return { prev, k };
        },
        onError: (_e,_p,ctx)=>{ if(ctx?.prev) (ctx as any).qc?.setQueryData(ctx.k, ctx.prev); },
        onSettled: ()=>{ qc.invalidateQueries(); }
    });
}


export async function flushQueue(run: (p:TxCreate)=>Promise<any>) {
    const jobs = await queue.all();
    if (!jobs.length) return;
    const remaining: typeof jobs = [];
    for (const j of jobs) {
        try { if (j.type === "tx.create") await run(j.payload); }
        catch { remaining.push(j); }
    }
    await queue.replace(remaining);
}