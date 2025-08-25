export type Versioned = { updatedAt?: string };

export type TxPayload = {
    type: "income" | "expense";
    amount: number;
    currency: string;
    note?: string | null;
    walletId: number;
    categoryId: number;
    occurredAt: string; // ISO
};

export type Tx = {
    id: number | string;
    userId?: number;
    updatedAt?: string;
} & TxPayload;