import AsyncStorage from "@react-native-async-storage/async-storage";
type Job = { id: string; type: "tx.create"; payload: any };

const KEY = "queue:v1";

async function read(): Promise<Job[]> {
    const raw = await AsyncStorage.getItem(KEY); return raw ? JSON.parse(raw) : [];
}
async function write(list: Job[]) { await AsyncStorage.setItem(KEY, JSON.stringify(list)); }

export const queue = {
    async push(job: Job) { const list = await read(); list.push(job); await write(list); },
    async all() { return read(); },
    async replace(list: Job[]) { await write(list); },
    async clear() { await write([]); }
};