import Screen from "@/components/ui/Screen";
import { View, Text, Pressable, TextInput } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";
import { useSettings } from "@/store/settings";

export default function Settings() {
    const logout = useAuthStore(s => s.logout);
    const { baseCurrency, setBaseCurrency, hydrate } = useSettings();
    const [cur, setCur] = useState(baseCurrency);

    useEffect(() => { hydrate(); }, []);
    useEffect(() => { setCur(baseCurrency); }, [baseCurrency]);

    return (
        <Screen>
            <View className="gap-3">
                <View className="border p-3 rounded">
                    <Text className="mb-2">Taban Para Birimi</Text>
                    <View className="flex-row gap-2">
                        <TextInput
                            value={cur}
                            onChangeText={setCur}
                            autoCapitalize="characters"
                            maxLength={3}
                            className="border p-2 rounded w-28"
                        />
                        <Pressable
                            onPress={() => setBaseCurrency(cur.trim().toUpperCase())}
                            className="bg-black px-3 rounded justify-center"
                        >
                            <Text className="text-white">Kaydet</Text>
                        </Pressable>
                    </View>
                    <Text className="text-gray-600 mt-1">Örn: TRY, USD, EUR</Text>
                </View>

                <Pressable onPress={() => router.push("/catalog/wallets")} className="border p-3 rounded">
                    <Text>Cüzdanlar</Text>
                </Pressable>
                <Pressable onPress={() => router.push("/catalog/categories")} className="border p-3 rounded">
                    <Text>Kategoriler</Text>
                </Pressable>
                <Pressable onPress={logout} className="border p-3 rounded">
                    <Text>Çıkış</Text>
                </Pressable>
            </View>
        </Screen>
    );
}