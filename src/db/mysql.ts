import { api } from "@/api/client";
import { Transaction } from "@/schemas/transaction";

export type Page<T> = { data: T[]; total: number };
export type TxCreate = Omit<Transaction, "id">;

export const mysql = {
    async listTransactions(params?: { page?: number; q?: string }): Promise<Page<Transaction>> {
        const { data } = await api.get("/v1/transactions", { params });
        return data;
    },
    async createTransaction(payload: TxCreate): Promise<Transaction> {
        const { data } = await api.post("/v1/transactions", payload);
        return data;
    },
};
