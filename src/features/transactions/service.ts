import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { queue, Job, TxPayload } from "@/offline/queue";
import { isOnline } from "@/offline/net";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Tx = {
    id: number | string;
    type: "income" | "expense";
    amount: number;
    currency: string;
    categoryId: number;
    walletId: number;
    note?: string | null;
    occurredAt: string;
};

export type Page = { total: number; data: Tx[] };

export function useTxList(q: string) {
    return useInfiniteQuery<Page, Error, Page, [string, string], number>({
        queryKey: ["tx.list", q],
        initialPageParam: 1,
        getNextPageParam: (last: Page, all: Page[], page: number) => {
            const total = last.total ?? 0;
            const loaded = all.reduce((n, p) => n + (p.data?.length || 0), 0);
            return loaded < total ? page + 1 : undefined;
        },
        queryFn: async ({ pageParam }): Promise<Page> => {
            const { data } = await api.get("/v1/transactions", { params: { page: pageParam, q } });
            return data as Page;
        },
    });
}

export function useCreateTx() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: TxPayload) => {
            if (await isOnline()) return (await api.post("/v1/transactions", payload)).data as Tx;
            const offlineId = `offline-${Date.now()}`;
            await queue.push({ kind: "tx.create", payload, localId: offlineId });
            return { id: offlineId, ...payload } as Tx;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["tx.list"] }),
    });
}

export function useUpdateTx() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: number | string; payload: TxPayload }) => {
            if (await isOnline()) return (await api.put(`/v1/transactions/${id}`, payload)).data as Tx;
            await queue.push({ kind: "tx.update", id, payload });
            return { id, ...payload } as Tx;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["tx.list"] }),
    });
}

export function useDeleteTx() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: number | string) => {
            if (await isOnline()) { await api.delete(`/v1/transactions/${id}`); return; }
            await queue.push({ kind: "tx.delete", id });
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["tx.list"] }),
    });
}

/* Range ve Summary */
export function useTxRange(fromISO: string, toISO: string, q: string = "") {
    return useQuery<Page>({
        queryKey: ["tx.range", fromISO, toISO, q],
        queryFn: async () =>
            (await api.get("/v1/transactions", { params: { from: fromISO, to: toISO, size: 500, q } }))
                .data as Page,
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

/* Delta Sync */
const SYNC_KEY = "lastSyncAt";

export async function flushQueue() {
    const jobs = await queue.all();
    if (!jobs.length) return;

    const remain: Job[] = [];
    for (const j of jobs) {
        try {
            if (j.kind === "tx.create") {
                await api.post("/v1/transactions", j.payload);
            } else if (j.kind === "tx.update") {
                await api.put(`/v1/transactions/${j.id}`, j.payload);
            } else if (j.kind === "tx.delete") {
                await api.delete(`/v1/transactions/${j.id}`);
            }
        } catch {
            remain.push(j);
        }
    }
    await queue.replace(remain);
}

export async function pullDelta() {
    let since = await AsyncStorage.getItem(SYNC_KEY);
    if (!since) since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

    const { data } = await api.get("/v1/sync/transactions", { params: { since } });
    await AsyncStorage.setItem(SYNC_KEY, new Date().toISOString());
    return data as Tx[];
}