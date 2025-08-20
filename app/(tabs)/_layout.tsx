import { Tabs } from "expo-router";

export default function TabsLayout() {
    return (
        <Tabs screenOptions={{ headerShown:false }}>
            <Tabs.Screen name="dashboard" options={{ title:"Özet" }} />
            <Tabs.Screen name="transactions" options={{ title:"Hareketler" }} />
            <Tabs.Screen name="reports" options={{ title:"Raporlar" }} />
            <Tabs.Screen name="settings" options={{ title:"Ayarlar" }} />
        </Tabs>
    );
}