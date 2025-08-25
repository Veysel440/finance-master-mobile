import Screen from "@/components/ui/Screen";
import { View, Text, Pressable, TextInput } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";
import { useSettings } from "@/store/settings";
import { A11yButton, A11yInput, A11yText } from "@/components/ui/A11y";

export default function Settings(){
    const logout = useAuthStore(s=>s.logout);
    const { baseCurrency, setBaseCurrency, hydrate } = useSettings();
    const [cur, setCur] = useState(baseCurrency);

    useEffect(()=>{ hydrate(); },[]);
    useEffect(()=>{ setCur(baseCurrency); },[baseCurrency]);

    return (
        <Screen>
            <View className="gap-3">
                <View className="border p-3 rounded">
                    <A11yText className="mb-2">Taban Para Birimi</A11yText>
                    <View className="flex-row gap-2 items-center">
                        <A11yInput
                            label="Taban para birimi gir"
                            value={cur}
                            onChangeText={setCur}
                            className="border p-2 rounded w-28"
                            autoCapitalize="characters"
                            maxLength={3}
                        />
                        <A11yButton
                            label="Para birimini kaydet"
                            onPress={()=>setBaseCurrency(cur.trim().toUpperCase())}
                            className="bg-black px-3 rounded justify-center"
                        >
                            <Text className="text-white">Kaydet</Text>
                        </A11yButton>
                    </View>
                    <Text className="text-gray-600 mt-1">Örn: TRY, USD, EUR</Text>
                </View>

                <A11yButton label="Cüzdanlar" onPress={()=>router.push("/catalog/wallets")} className="border p-3 rounded">
                    <Text>Cüzdanlar</Text>
                </A11yButton>

                <A11yButton label="Kategoriler" onPress={()=>router.push("/catalog/categories")} className="border p-3 rounded">
                    <Text>Kategoriler</Text>
                </A11yButton>

                <A11yButton label="İki Aşamalı Doğrulama" onPress={()=>router.push("/settings/totp")} className="border p-3 rounded">
                    <Text>İki Aşamalı Doğrulama (TOTP)</Text>
                </A11yButton>

                <A11yButton label="Çıkış" onPress={logout} className="border p-3 rounded">
                    <Text>Çıkış</Text>
                </A11yButton>
            </View>
        </Screen>
    );
}