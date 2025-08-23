import AsyncStorage from "@react-native-async-storage/async-storage";

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
    | { kind: "tx.create"; payload: TxPayload; localId: string }
    | { kind: "tx.update"; id: number | string; payload: TxPayload; base?: BaseSnapshot }
    | { kind: "tx.delete"; id: number | string };

const QKEY = "offline_queue_v2";
const MAPKEY = "idmap_v1";
const CKEY = "tx_conflicts_v1";

type IdMap = Record<string /*offline-...*/, number /*serverId*/>;
export type Conflict = {
    when: string;
    job: Job;
    server: any;
    reason: "diverged";
};

async function all(): Promise<Job[]> {
    const raw = await AsyncStorage.getItem(QKEY);
    return raw ? (JSON.parse(raw) as Job[]) : [];
}
async function push(job: Job) {
    const list = await all();
    list.push(job);
    await AsyncStorage.setItem(QKEY, JSON.stringify(list));
}
async function replace(list: Job[]) {
    await AsyncStorage.setItem(QKEY, JSON.stringify(list));
}


async function getMap(): Promise<IdMap> {
    const raw = await AsyncStorage.getItem(MAPKEY);
    return raw ? JSON.parse(raw) : {};
}
async function setMap(m: IdMap) { await AsyncStorage.setItem(MAPKEY, JSON.stringify(m)); }
export async function setMapping(localId: string, serverId: number) {
    const m = await getMap(); m[localId] = serverId; await setMap(m);
}
export async function resolveId(id: number | string): Promise<number | string> {
    if (typeof id === "string" && id.startsWith("offline-")) {
        const m = await getMap(); if (m[id]) return m[id];
    }
    return id;
}


export async function addConflict(c: Conflict) {
    const raw = await AsyncStorage.getItem(CKEY);
    const list: Conflict[] = raw ? JSON.parse(raw) : [];
    list.push(c);
    await AsyncStorage.setItem(CKEY, JSON.stringify(list));
}
export async function listConflicts(): Promise<Conflict[]> {
    const raw = await AsyncStorage.getItem(CKEY);
    return raw ? JSON.parse(raw) : [];
}
export async function clearConflicts() { await AsyncStorage.removeItem(CKEY); }

export const queue = { all, push, replace };

