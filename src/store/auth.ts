import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { api } from "@/api/client";

type User = { id:string; name:string; email:string };

type State = {
    ready:boolean; user:User|null;
    init:()=>Promise<void>;
    login:(p:{email:string;password:string})=>Promise<boolean>;
    logout:()=>Promise<void>;
};

export const useAuthStore = create<State>((set)=>({
    ready:false, user:null,
    init: async ()=>{
        const raw = await SecureStore.getItemAsync("user");
        set({ ready:true, user: raw ? JSON.parse(raw) as User : null });
    },
    login: async ({email,password})=>{
        try{
            const { data } = await api.post("/v1/auth/login",{email,password});
            await SecureStore.setItemAsync("access_token", data.token);
            await SecureStore.setItemAsync("user", JSON.stringify(data.user));
            set({ user: data.user }); return true;
        } catch { return false; }
    },
    logout: async ()=>{
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("user");
        set({ user:null });
    }
}));