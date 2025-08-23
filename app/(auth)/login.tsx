import Screen from "@/components/ui/Screen";
import { View, TextInput, Text, Pressable, Alert } from "react-native";
import { useState } from "react";
import { useAuthStore } from "@/store/auth";

export default function Login(){
    const login = useAuthStore(s=>s.login);
    const [email,setEmail] = useState(""); const [password,setPassword]=useState("");
    const [needTotp,setNeedTotp] = useState(false); const [totp,setTotp]=useState("");

    const submit = async ()=>{
        const res = await login(email, password, needTotp ? totp : undefined);
        if (res === "ok") return;
        if (res === "totp_required") { setNeedTotp(true); return; }
        Alert.alert("Hata","Giriş başarısız");
    };

    return (
        <Screen>
            <View className="gap-3">
                <TextInput placeholder="E-posta" autoCapitalize="none" value={email} onChangeText={setEmail} className="border p-3 rounded"/>
                <TextInput placeholder="Şifre" secureTextEntry value={password} onChangeText={setPassword} className="border p-3 rounded"/>
                {needTotp && (
                    <TextInput placeholder="TOTP kodu" keyboardType="number-pad" value={totp} onChangeText={setTotp} className="border p-3 rounded"/>
                )}
                <Pressable onPress={submit} className="bg-black px-4 py-3 rounded"><Text className="text-white">Giriş</Text></Pressable>
            </View>
        </Screen>
    );
}