import "@/i18n";
import "@/monitoring/sentry";
import "@/security/clipboard-guard";

import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";

import { useAuthStore } from "@/store/auth";
import { useSettings } from "@/store/settings";
import { bindQueryClient, syncNow } from "@/sync/sync";
import { onReconnect } from "@/offline/net";

import { ToastProvider, useToast } from "@/ui/toast/ToastProvider";
import { bindToast } from "@/ui/toast/bridge";
import ErrorBoundary from "@/ui/ErrorBoundary";

const qc = new QueryClient();

function ToastBinder() {
    const { show } = useToast();
    useEffect(() => { bindToast(show); }, [show]);
    return null;
}

export default function RootLayout() {
    const initAuth = useAuthStore((s: { init: () => Promise<void> }) => s.init);
    const hydrateSettings = useSettings((s: { hydrate: () => Promise<void> }) => s.hydrate);

    useEffect(() => {
        initAuth();
        hydrateSettings();
        bindQueryClient(qc);
        syncNow().catch(() => {});
    }, [initAuth, hydrateSettings]);

    useEffect(() => {
        const unsub = onReconnect(() => { syncNow().catch(() => {}); });
        return () => { unsub && unsub(); };
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider client={qc}>
                <ToastProvider>
                    <ToastBinder />
                    <ErrorBoundary>
                        <Stack screenOptions={{ headerShown: false }} />
                    </ErrorBoundary>
                </ToastProvider>
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}