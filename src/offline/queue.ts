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

export type Job =
    | { kind: "tx.create"; payload: TxPayload; localId?: string }
    | { kind: "tx.update"; id: number | string; payload: TxPayload }
    | { kind: "tx.delete"; id: number | string };

const KEY = "offline_queue_v2";

async function all(): Promise<Job[]> {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Job[]) : [];
}
async function push(job: Job) {
    const list = await all();
    list.push(job);
    await AsyncStorage.setItem(KEY, JSON.stringify(list));
}
async function replace(list: Job[]) {
    await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export const queue = { all, push, replace };