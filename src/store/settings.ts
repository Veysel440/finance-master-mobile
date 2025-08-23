import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

type State = {
    baseCurrency: string;
    setBaseCurrency: (c: string) => Promise<void>;
    hydrate: () => Promise<void>;
};

export const useSettings = create<State>((set) => ({
    baseCurrency: "TRY",
    setBaseCurrency: async (c) => { await AsyncStorage.setItem("baseCurrency", c); set({ baseCurrency: c }); },
    hydrate: async () => { const v = await AsyncStorage.getItem("baseCurrency"); if (v) set({ baseCurrency: v }); },
}));