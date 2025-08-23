import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { useSettings } from "@/store/settings";
import { onReconnect } from "@/offline/net";
import { syncNow, bindQueryClient } from "@/sync/sync";

const qc = new QueryClient();

export default function RootLayout() {
    const initAuth = useAuthStore(s => s.init);
    const hydrateSettings = useSettings(s => s.hydrate);

    useEffect(() => {
        initAuth();
        hydrateSettings();
        bindQueryClient(qc);
        // açılışta bir kez
        syncNow().catch(()=>{});
    }, [initAuth, hydrateSettings]);

    useEffect(() => {
        const unsub = onReconnect(() => { syncNow().catch(()=>{}); });
        return () => { unsub && unsub(); };
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider client={qc}>
                <Stack screenOptions={{ headerShown: false }} />
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}