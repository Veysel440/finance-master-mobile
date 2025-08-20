import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/auth";

export default function Index() {
    const ready = useAuthStore(s=>s.ready);
    const user  = useAuthStore(s=>s.user);
    if (!ready) return null;
    return <Redirect href={user ? "/(tabs)/dashboard" : "/(auth)/login"} />;
}