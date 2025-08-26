import { api } from "@/api/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export type RatesResp = { base: string; date: string; rates: Record<string, number> };

export async function getLatestRates(base?: string): Promise<RatesResp> {
    const { data } = await api.get("/v1/rates/latest", { params: base ? { base } : undefined });
    return data;
}

export function useRatesLatest(base: string, refetchMs = 5 * 60 * 1000) {
    return useQuery({
        queryKey: ["rates.latest", base],
        queryFn: () => getLatestRates(base),
        refetchInterval: refetchMs,
        staleTime: 60 * 1000,
    });
}

/** base tablosundan from -> to çevir */
export function convert(amount: number, from: string, to: string, table: Record<string, number>, base: string): number {
    if (from === to) return amount;
    if (from !== base) amount = amount / (table[from] ?? 1);
    if (to !== base) amount = amount * (table[to] ?? 1);
    return amount;
}

/** Manuel invalidation örneği */
export function invalidateRates(qc: ReturnType<typeof useQueryClient>, base: string) {
    qc.invalidateQueries({ queryKey: ["rates.latest", base] });
}