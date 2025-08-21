import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { queue } from "@/offline/queue";
import { isOnline } from "@/offline/net";

export type Tx = {
    id: string | number;
    type: "income" | "expense";
    amount: number;
    currency: string;
    categoryId: number;
    walletId: number;
    note?: string;
    occurredAt: string;
};


type Page = { total: number; data: Tx[] };

export function useTxList(q: string) {
    return useInfiniteQuery<Page, Error, Page, [string, string], number>({
        queryKey: ["tx.list", q],
        initialPageParam: 1,
        queryFn: async ({ pageParam }): Promise<Page> => {
            const { data } = await api.get("/v1/transactions", {
                params: { page: pageParam, q },
            });
            return data as Page;
        },
        getNextPageParam: (last: Page, all: Page[], lastPageParam: number) => {
            const total = last.total ?? 0;
            const loaded = all.reduce((n, p) => n + (p.data?.length ?? 0), 0);
            return loaded < total ? lastPageParam + 1 : undefined;
        },
    });
}

export function useCreateTx() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: Omit<Tx, "id">) => {
            if (await isOnline()) return (await api.post("/v1/transactions", payload)).data as Tx;
            const offlineId = `offline-${Date.now()}`;
            await queue.push({ id: offlineId, type: "tx.create", payload });
            return { id: offlineId, ...payload } as Tx;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["tx.list"] }),
    });
}

export type TxSummary = { date: string; type: "income" | "expense"; total: number };

export function useTxSummary(fromISO: string, toISO: string) {
    return useQuery<TxSummary[]>({
        queryKey: ["tx.summary", fromISO, toISO],
        queryFn: async () =>
            (await api.get("/v1/transactions/summary", { params: { from: fromISO, to: toISO } })).data,
    });
}


export async function flushQueue() {
    const jobs = await queue.all();
    if (!jobs.length) return;
    const remain: any[] = [];
    for (const j of jobs) {
        try {
            if (j.type === "tx.create") await api.post("/v1/transactions", j.payload);
        } catch {
            remain.push(j);
        }
    }
    await queue.replace(remain);
}