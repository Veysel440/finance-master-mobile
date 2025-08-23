import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { api } from "@/api/client";

type User = { id:number; email:string };
type State = {
    user?: User;
    token?: string;
    login: (email:string, password:string, totp?:string) => Promise<"ok"|"totp_required"|"error">;
    logout: () => Promise<void>;
    init: () => Promise<void>;
};

export const useAuthStore = create<State>((set)=>{
    return {
        async login(email, password, totp){
            try{
                const { data } = await api.post("/v1/auth/login", { email, password, totp, deviceId:"mobile", deviceName:"RN" });
                set({ user: data.user, token: data.token });
                await SecureStore.setItemAsync("token", data.token);
                await SecureStore.setItemAsync("refresh", data.refresh);
                api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
                return "ok";
            }catch(e:any){
                const code = e?.response?.data?.code;
                if (code === "totp_required") return "totp_required";
                return "error";
            }
        },
        async logout(){
            try{
                const refresh = await SecureStore.getItemAsync("refresh");
                if (refresh) await api.post("/v1/auth/logout", { refresh });
            }catch{}
            await SecureStore.deleteItemAsync("token");
            await SecureStore.deleteItemAsync("refresh");
            set({ user: undefined, token: undefined });
            delete api.defaults.headers.common.Authorization;
        },
        async init(){
            const t = await SecureStore.getItemAsync("token");
            if (t) { set({ token: t }); api.defaults.headers.common.Authorization = `Bearer ${t}`; }
        }
    };
});