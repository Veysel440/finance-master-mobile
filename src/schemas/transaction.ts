import { z } from "zod";
export const TransactionSchema = z.object({
    id: z.string().optional(),
    type: z.enum(["income","expense"]),
    amount: z.number().positive(),
    currency: z.string().length(3),
    categoryId: z.string(),
    walletId: z.string(),
    note: z.string().optional(),
    occurredAt: z.string()
});
export type Transaction = z.infer<typeof TransactionSchema>;