import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { queue, Job, TxPayload, setMapping, resolveId, addConflict, BaseSnapshot } from "@/offline/queue";
import { isOnline } from "@/offline/net";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import type { InfiniteData } from "@tanstack/react-query";

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

export function useTxOne(id?: string | number) {
    return useQuery<Tx>({
        queryKey: ["tx.one", id],
        enabled: !!id,
        queryFn: async () => (await api.get(`/v1/transactions/${id}`)).data as Tx,
    });
}
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
        queryFn: async ({ pageParam }) => {
            const { data } = await api.get("/v1/transactions", { params: { page: pageParam, q } });
            return data as TxPage;
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
        mutationFn: async ({ id, payload, base }: { id: number | string; payload: TxPayload; base?: BaseSnapshot }) => {
            if (await isOnline()) return (await api.put(`/v1/transactions/${id}`, payload)).data as Tx;
            await queue.push({ kind: "tx.update", id, payload, base });
            return { id, ...payload } as Tx;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["tx.list"] });
            qc.invalidateQueries({ queryKey: ["tx.one"] });
        },
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


export function useTxRange(fromISO: string, toISO: string, q: string = "") {
    return useQuery<{ total: number; data: Tx[] }>({
        queryKey: ["tx.range", fromISO, toISO, q],
        queryFn: async () => (await api.get("/v1/transactions", { params: { from: fromISO, to: toISO, size: 500, q } })).data,
    });
}
export type TxSummary = { date: string; type: "income" | "expense"; total: number };
export function useTxSummary(fromISO: string, toISO: string) {
    return useQuery<TxSummary[]>({
        queryKey: ["tx.summary", fromISO, toISO],
        queryFn: async () => (await api.get("/v1/transactions/summary", { params: { from: fromISO, to: toISO } })).data,
    });
}


const SYNC_KEY = "lastSyncAt";

export async function flushQueue() {
    const jobs = await queue.all();
    if (!jobs.length) return;

    const remain: Job[] = [];

    for (const j of jobs) {
        try {
            if (j.kind === "tx.create") {

                const res = await api.post("/v1/transactions", j.payload);
                const serverId: number = res.data?.id;
                if (serverId) await setMapping(j.localId, serverId);
            } else if (j.kind === "tx.update") {
                const sid = await resolveId(j.id);
                if (typeof sid === "string") {
                    remain.push(j); continue;
                }

                let diverged = false;
                if (j.base) {
                    const { data: cur } = await api.get(`/v1/transactions/${sid}`);
                    if (divergedWithBase(cur as Tx, j.base)) {
                        diverged = true;
                        await addConflict({ when: new Date().toISOString(), job: j, server: cur, reason: "diverged" });
                    }
                }
                if (diverged) { remain.push(j); continue; }
                await api.put(`/v1/transactions/${sid}`, j.payload);
            } else if (j.kind === "tx.delete") {
                const sid = await resolveId(j.id);
                if (typeof sid === "string") { remain.push(j); continue; }
                await api.delete(`/v1/transactions/${sid}`);
            }
        } catch {

            remain.push(j);
        }
    }

    await queue.replace(remain);


    if (remain.some(j => j.kind === "tx.update")) {
        Toast.show({ type: "info", text1: "Bazı değişiklikler beklemede", text2: "Çakışmalar var. Daha sonra yeniden denenecek." });
    }
}

function divergedWithBase(cur: Tx, base: BaseSnapshot): boolean {
    if (base.amount !== undefined && Number(cur.amount) !== Number(base.amount)) return true;
    if (base.currency && cur.currency !== base.currency) return true;
    if (base.note !== undefined && (cur.note || "") !== (base.note || "")) return true;
    if (base.walletId && cur.walletId !== base.walletId) return true;
    if (base.categoryId && cur.categoryId !== base.categoryId) return true;
    if (base.occurredAt && cur.occurredAt !== base.occurredAt) return true;
    if (base.updatedAt && cur.updatedAt && cur.updatedAt !== base.updatedAt) return true;
    return false;
}

export async function pullDelta() {
    let since = await AsyncStorage.getItem(SYNC_KEY);
    if (!since) since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    await api.get("/v1/sync/transactions", { params: { since } });
    await AsyncStorage.setItem(SYNC_KEY, new Date().toISOString());
}