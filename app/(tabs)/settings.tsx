import Screen from "@/components/ui/Screen";
import { Text } from "react-native";
import { useAuthStore } from "@/store/auth";
import { Pressable } from "react-native";
export default function Settings(){
    const logout = useAuthStore(s=>s.logout);
    return <Screen>
        <Text>Ayarlar</Text>
        <Pressable onPress={logout}><Text>Çıkış</Text></Pressable>
    </Screen>;
}