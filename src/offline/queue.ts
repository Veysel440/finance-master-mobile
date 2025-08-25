
import AsyncStorage from "@react-native-async-storage/async-storage";
import { enc, dec } from "@/crypto/secure";


export type TxPayload = {
    type: "income" | "expense";
    amount: number;
    currency: string;
    note?: string | null;
    walletId: number;
    categoryId: number;
    occurredAt: string;
};

export type BaseSnapshot = Partial<TxPayload> & { updatedAt?: string };

export type Job =
    | { kind: "tx.create"; payload: TxPayload; localId?: string }
    | { kind: "tx.update"; id: number | string; payload: TxPayload; prevUpdatedAt?: string }
    | { kind: "tx.delete"; id: number | string };

type IdMap = Record<string /* offline-... */, number /* serverId */>;

export type Conflict = {
    when: string;
    job: Job;
    server: unknown;
    reason: "diverged";
};


const QKEY = "offline_queue_v3";
const MAPKEY = "idmap_v1";
const CKEY = "tx_conflicts_v2";



async function readJSON<T>(key: string, fallback: T): Promise<T> {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch {
        await AsyncStorage.removeItem(key);
        return fallback;
    }
}



async function readQueueChunks(): Promise<string[]> {
    return readJSON<string[]>(QKEY, []);
}

async function writeQueueChunks(chunks: string[]) {
    await AsyncStorage.setItem(QKEY, JSON.stringify(chunks));
}

export const queue = {
    async push(j: Job) {
        const list = await readQueueChunks();
        list.push(await enc(j));
        await writeQueueChunks(list);
    },

    async all(): Promise<Job[]> {
        const chunks = await readQueueChunks();
        const jobs: Job[] = [];
        for (const c of chunks) jobs.push(await dec<Job>(c));
        return jobs;
    },

    async replace(js: Job[]) {
        const encs: string[] = [];
        for (const j of js) encs.push(await enc(j));
        await writeQueueChunks(encs);
    },

    async clear() {
        await writeQueueChunks([]);
    },
};



async function getMap(): Promise<IdMap> {
    return readJSON<IdMap>(MAPKEY, {});
}

async function setMap(m: IdMap) {
    await AsyncStorage.setItem(MAPKEY, JSON.stringify(m));
}

export async function setMapping(localId: string, serverId: number) {
    const m = await getMap();
    m[localId] = serverId;
    await setMap(m);
}

export async function resolveId(id: number | string): Promise<number | string> {
    if (typeof id === "string" && id.startsWith("offline-")) {
        const m = await getMap();
        if (m[id] != null) return m[id];
    }
    return id;
}



async function readConflictChunks(): Promise<string[]> {
    return readJSON<string[]>(CKEY, []);
}

async function writeConflictChunks(chunks: string[]) {
    await AsyncStorage.setItem(CKEY, JSON.stringify(chunks));
}

export async function addConflict(c: Conflict) {
    const list = await readConflictChunks();
    list.push(await enc(c));
    await writeConflictChunks(list);
}

export async function listConflicts(): Promise<Conflict[]> {
    const chunks = await readConflictChunks();
    const out: Conflict[] = [];
    for (const c of chunks) out.push(await dec<Conflict>(c));
    return out;
}

export async function clearConflicts() {
    await AsyncStorage.removeItem(CKEY);
}