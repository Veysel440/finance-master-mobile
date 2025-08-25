import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { resetOnLogout } from "@/sync/sync";

type User = { id: number; email: string } | null;

type AuthState = {
    token: string | null;
    refresh: string | null;
    user: User;
    setAuth: (token: string, refresh?: string) => void;
    init: () => Promise<void>;
    logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()((set, _get) => ({
    token: null,
    refresh: null,
    user: null,
    setAuth: (token, refresh) => set({ token, refresh: refresh ?? null }),
    init: async () => {
        const token = (await SecureStore.getItemAsync("token")) ?? null;
        const refresh = (await SecureStore.getItemAsync("refresh")) ?? null;
        set({ token, refresh });
    },
    logout: async () => {
        set({ token: null, refresh: null, user: null });
        await SecureStore.deleteItemAsync("token");
        await SecureStore.deleteItemAsync("refresh");
        await AsyncStorage.multiRemove(["lastSyncAt"]);
        await resetOnLogout();
    },
}));