import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

const qc = new QueryClient();

export default function Root() {
    const init = useAuthStore(s => s.init);
    useEffect(() => { init(); }, [init]);
    return (
        <GestureHandlerRootView style={{ flex:1 }}>
            <QueryClientProvider client={qc}>
                <Stack screenOptions={{ headerShown:false }} />
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}