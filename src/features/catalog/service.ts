import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";

export type Wallet = { id:number; name:string; currency:string };
export type Category = { id:number; name:string; type:"income"|"expense" };

export function useWallets(){
    return useQuery<Wallet[]>({ queryKey:["wallets"], queryFn: async()=> (await api.get("/v1/wallets")).data });
}
export function useCategories(type?: "income"|"expense"){
    return useQuery<Category[]>({
        queryKey:["categories", type||""],
        queryFn: async()=> (await api.get("/v1/categories",{ params: { type } })).data
    });
}
