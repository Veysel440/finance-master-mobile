import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

/* Mutations */
export function useCreateWallet(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (p:{name:string; currency:string}) => (await api.post("/v1/wallets", p)).data as Wallet,
        onSuccess: ()=> qc.invalidateQueries({ queryKey:["wallets"] })
    });
}
export function useUpdateWallet(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (p:{id:number; name:string; currency:string}) => (await api.put(`/v1/wallets/${p.id}`, p)).data as Wallet,
        onSuccess: ()=> qc.invalidateQueries({ queryKey:["wallets"] })
    });
}
export function useDeleteWallet(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id:number) => { await api.delete(`/v1/wallets/${id}`); },
        onSuccess: ()=> qc.invalidateQueries({ queryKey:["wallets"] })
    });
}

export function useCreateCategory(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (p:{name:string; type:"income"|"expense"}) => (await api.post("/v1/categories", p)).data as Category,
        onSuccess: (_d,_p)=> qc.invalidateQueries({ queryKey:["categories"] })
    });
}
export function useUpdateCategory(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (p:{id:number; name:string; type:"income"|"expense"}) => (await api.put(`/v1/categories/${p.id}`, p)).data as Category,
        onSuccess: (_d,p)=> qc.invalidateQueries({ queryKey:["categories", p.type] })
    });
}
export function useDeleteCategory(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id:number) => { await api.delete(`/v1/categories/${id}`); },
        onSuccess: ()=> qc.invalidateQueries({ queryKey:["categories"] })
    });
}