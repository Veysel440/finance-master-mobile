import { Tx, TxPayload } from "./types";

export class ConflictError extends Error {
    constructor(public server: Tx, public client: { id: number | string; payload: TxPayload; prevUpdatedAt?: string }) {
        super("conflict");
    }
}

export function lastWriteWins(server: Tx, client: TxPayload): TxPayload {
    return client; // LWW
}

export function clientWins(server: Tx, client: TxPayload): TxPayload {
    return client;
}

export function smartMerge(server: Tx, client: TxPayload): TxPayload {
    if (server.note && client.note && server.note !== client.note) {
        const merged = `${client.note}\n— merged with server —\n${server.note}`;
        return { ...client, note: merged.slice(0, 1000) };
    }
    return client;
}


export function pickStrategy(name: "lww" | "client" | "smart") {
    return name === "client" ? clientWins : name === "smart" ? smartMerge : lastWriteWins;
}