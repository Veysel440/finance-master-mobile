import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { queue, Job } from "@/offline/queue";
import { isOnline } from "@/offline/net";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { toast } from "@/ui/toast/bridge";
import type { InfiniteData } from "@tanstack/react-query";

export class ConflictError extends Error {
    constructor(public server: Tx, public client: { id: number | string; payload: TxPayload; prevUpdatedAt?: string }) {
        super("conflict");
    }
}
function smartMerge(server: Tx, client: TxPayload): TxPayload {
    if (server.note && client.note && server.note !== client.note) {
        const merged = `${client.note}\n— merged with server —\n${server.note}`;
        return { ...client, note: merged.slice(0, 1000) };
    }
    return client;
}

export type Tx = {
    id: number | string;
    type: "income" | "expense";
    amount: number;
    currency: string;
    categoryId: number;
    walletId: number;
    note?: string | null;
    occurredAt: string;
    updatedAt?: string;
};

export type TxPage = { total: number; data: Tx[] };

export type TxPayload = {
    type: "income" | "expense";
    amount: number;
    currency: string;
    note?: string | null;
    walletId: number;
    categoryId: number;
    occurredAt: string;
};

export function useTxList(q: string) {
    return useInfiniteQuery<
        TxPage,
        Error,
        InfiniteData<TxPage, number>,
        readonly ["tx.list", string],
        number
    >({
        queryKey: ["tx.list", q] as const,
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            const total = lastPage.total ?? 0;
            const loaded = allPages.reduce((n, p) => n + (p.data?.length ?? 0), 0);
            return loaded < total ? lastPageParam + 1 : undefined;
        },
        queryFn: async ({ pageParam }): Promise<TxPage> => {
            const { data } = await api.get("/v1/transactions", {
                params: { page: pageParam, q },
            });
            return data as TxPage;
        },
    });
}
export function useTxRange(fromISO: string, toISO: string, q = "") {
    return useQuery<{ total: number; data: Tx[] }>({
        queryKey: ["tx.range", fromISO, toISO, q],
        queryFn: async () =>
            (await api.get("/v1/transactions", { params: { from: fromISO, to: toISO, size: 500, q } })).data,
    });
}

export type TxSummary = { date: string; type: "income" | "expense"; total: number };
export function useTxSummary(fromISO: string, toISO: string) {
    return useQuery<TxSummary[]>({
        queryKey: ["tx.summary", fromISO, toISO],
        queryFn: async () => (await api.get("/v1/transactions/summary", { params: { from: fromISO, to: toISO } })).data,
    });
}

export function useCreateTx() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: TxPayload) => {
            if (await isOnline()) return (await api.post("/v1/transactions", payload)).data as Tx;
            const offlineId = `offline-${Date.now()}`;
            await queue.push({ kind: "tx.create", payload, localId: offlineId });
            return { id: offlineId, ...payload, updatedAt: new Date().toISOString() } as Tx;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["tx.list"] });
            qc.invalidateQueries({ queryKey: ["tx.range"] });
            qc.invalidateQueries({ queryKey: ["tx.summary"] });
        },
    });
}

export function useUpdateTxOptimistic() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (p: { id: number | string; payload: TxPayload; prevUpdatedAt?: string }): Promise<Tx> => {
            if (await isOnline()) {
                try {
                    const { data } = await api.put(`/v1/transactions/${p.id}`, p.payload, {
                        headers: p.prevUpdatedAt ? { "If-Unmodified-Since": p.prevUpdatedAt as string } : undefined,
                    });
                    return data as Tx;
                } catch (e: any) {
                    const code = e?.response?.data?.code;
                    if (e?.response?.status === 409 || code === "conflict") {
                        const srv = (await api.get(`/v1/transactions/${p.id}`)).data as Tx;
                        throw new ConflictError(srv, p);
                    }
                    throw e;
                }
            }
            await queue.push({ kind: "tx.update", id: p.id, payload: p.payload, prevUpdatedAt: p.prevUpdatedAt });
            return { id: p.id, ...p.payload, updatedAt: new Date().toISOString() } as Tx;
        },
        onMutate: async (vars) => {
            const snapList = qc.getQueriesData<{ total: number; data: Tx[] }>({ queryKey: ["tx.list"] });
            const snapOne = qc.getQueryData<Tx>(["tx.one", String(vars.id)]);
            const apply = (arr?: Tx[]) => arr?.map((t) => (t.id === vars.id ? ({ ...t, ...vars.payload } as Tx) : t));
            snapList.forEach(([key, val]) => { if (!val) return; qc.setQueryData(key, { ...val, data: apply(val.data) || [] }); });
            if (snapOne) qc.setQueryData(["tx.one", String(vars.id)], { ...snapOne, ...vars.payload });
            return { snapList, snapOne };
        },
        onError: (err, vars, ctx) => {
            ctx?.snapList?.forEach(([key, val]: any) => qc.setQueryData(key, val));
            if (ctx?.snapOne) qc.setQueryData(["tx.one", String(vars.id)], ctx.snapOne);
            if (err instanceof ConflictError) {
                toast("Çatışma: Sunucuda değişiklik var.", "error");
                const merged = smartMerge(err.server, err.client.payload);
                api
                    .put(`/v1/transactions/${err.client.id}`, merged, {
                        headers: err.client.prevUpdatedAt ? { "If-Unmodified-Since": err.client.prevUpdatedAt } : undefined,
                    })
                    .then(() => qc.invalidateQueries({ queryKey: ["tx"] }))
                    .catch(() => {});
            }
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: ["tx.list"] });
            qc.invalidateQueries({ queryKey: ["tx.range"] });
            qc.invalidateQueries({ queryKey: ["tx.summary"] });
        },
    });
}

export function useDeleteTxOptimistic() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: number | string) => {
            if (await isOnline()) { await api.delete(`/v1/transactions/${id}`); return; }
            await queue.push({ kind: "tx.delete", id });
        },
        onMutate: async (id) => {
            const snapList = qc.getQueriesData<{ total: number; data: Tx[] }>({ queryKey: ["tx.list"] });
            const snapOne = qc.getQueryData<Tx>(["tx.one", String(id)]);
            snapList.forEach(([key, val]) => {
                if (!val) return;
                qc.setQueryData(key, { ...val, data: (val.data || []).filter((t) => t.id !== id) });
            });
            qc.removeQueries({ queryKey: ["tx.one", String(id)] });
            return { snapList, snapOne, id };
        },
        onError: (_e, _id, ctx) => {
            ctx?.snapList?.forEach(([key, val]: any) => qc.setQueryData(key, val));
            if (ctx?.snapOne) qc.setQueryData(["tx.one", String(ctx.id)], ctx.snapOne);
            toast("Silme işlemi geri alındı.", "info");
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: ["tx.list"] });
            qc.invalidateQueries({ queryKey: ["tx.range"] });
            qc.invalidateQueries({ queryKey: ["tx.summary"] });
        },
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
                await api.put(`/v1/transactions/${j.id}`, j.payload, {
                    headers: j.prevUpdatedAt ? { "If-Unmodified-Since": j.prevUpdatedAt } : undefined,
                });
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