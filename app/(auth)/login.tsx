import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth";

export default function Login() {
    const [email,setEmail] = useState(""); const [password,setPassword]=useState("");
    const login = useAuthStore(s=>s.login); const [err,setErr]=useState<string|null>(null);
    const onSubmit = async () => { setErr(null); (await login({email,password})) ? router.replace("/(tabs)/dashboard") : setErr("Giriş başarısız"); };
    return (
        <View className="flex-1 items-center justify-center p-6">
            <Text className="text-2xl font-bold mb-6">Finance Master</Text>
            <TextInput className="w-full border p-3 mb-3 rounded" placeholder="E-posta" value={email} onChangeText={setEmail}/>
            <TextInput className="w-full border p-3 mb-3 rounded" placeholder="Şifre" secureTextEntry value={password} onChangeText={setPassword}/>
            {err ? <Text className="text-red-500 mb-2">{err}</Text> : null}
            <Pressable onPress={onSubmit} className="bg-black p-3 rounded w-full items-center"><Text className="text-white">Giriş</Text></Pressable>
        </View>
    );
}