import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
    const init = useAuthStore((s) => s.init);
    const user = useAuthStore((s) => s.user);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let alive = true;
        init().finally(() => alive && setReady(true));
        return () => {
            alive = false;
        };
    }, [init]);

    if (!ready) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator />
            </View>
        );
    }
    return <Redirect href={user ? "/(tabs)/dashboard" : "/(auth)/login"} />;
}