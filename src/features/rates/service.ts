import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";

export type Rates = { base:string; date:string; rates: Record<string, number> };

export function useLatestRates(base:string){
    return useQuery<Rates>({
        queryKey:["rates.latest", base],
        queryFn: async ()=> (await api.get("/v1/rates/latest", { params:{ base } })).data,
        enabled: !!base
    });
}

export function convert(amount:number, from:string, to:string, rates?:Rates): number {
    if (!rates || from===to) return amount;
    const rTo = rates.rates[to]; const rFrom = rates.rates[from] || (from===rates.base?1:undefined);
    if (!rTo) return amount;
    if (!rFrom) return amount;

    const inBase = from===rates.base ? amount : amount / rFrom;
    return to===rates.base ? inBase : inBase * rTo;
}