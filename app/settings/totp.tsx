import Screen from "@/components/ui/Screen";
import { View, Text, Pressable, TextInput, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { totpSetup, totpConfirm } from "@/features/auth/totp";
import { useAuthStore } from "@/store/auth";
import QRCode from "react-native-qrcode-svg";
import { useRouter } from "expo-router";
import { toast } from "@/ui/toast/bridge";

export default function TotpScreen(){
    const router = useRouter();
    const user = useAuthStore(s => s.user);
    const [secret, setSecret] = useState<string>("");
    const [otpauth, setOtpauth] = useState<string>("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState<1|2>(1);

    useEffect(() => {
        (async ()=>{
            try {
                const { secret, otpauth } = await totpSetup(user?.email);
                setSecret(secret);
                setOtpauth(otpauth);
            } catch {}
            setLoading(false);
        })();
    }, []);

    const onConfirm = async () => {
        try {
            if (!code || code.length < 6) { toast("6 haneli kod gir.", "error"); return; }
            await totpConfirm(code);
            toast("TOTP aktif.", "success");
            router.back();
        } catch {}
    };

    if (loading) return <Screen><ActivityIndicator/></Screen>;

    return (
        <Screen>
            {step === 1 && (
                <View className="gap-3 items-center">
                    <Text className="text-xl font-bold">2FA (TOTP) Kurulumu</Text>
                    {otpauth ? <QRCode value={otpauth} size={180}/> : null}
                    <View className="w-full">
                        <Text className="text-gray-700 mb-1">Gizli Anahtar</Text>
                        <View className="border rounded p-3">
                            <Text selectable>{secret}</Text>
                        </View>
                        <Text className="text-gray-500 mt-1">Authenticator uygulamasıyla QR’ı tara veya anahtarı gir.</Text>
                    </View>
                    <Pressable onPress={()=>setStep(2)} className="bg-black px-4 py-3 rounded">
                        <Text className="text-white">Devam et</Text>
                    </Pressable>
                </View>
            )}

            {step === 2 && (
                <View className="gap-3">
                    <Text className="text-xl font-bold">Kodu Doğrula</Text>
                    <Text className="text-gray-600">Authenticator'daki 6 haneli kodu gir.</Text>
                    <TextInput
                        value={code}
                        onChangeText={setCode}
                        keyboardType="number-pad"
                        maxLength={6}
                        className="border p-3 rounded"
                        placeholder="123456"
                    />
                    <View className="flex-row gap-2">
                        <Pressable onPress={()=>setStep(1)} className="border px-4 py-3 rounded">
                            <Text>Geri</Text>
                        </Pressable>
                        <Pressable onPress={onConfirm} className="bg-black px-4 py-3 rounded">
                            <Text className="text-white">Onayla</Text>
                        </Pressable>
                    </View>
                </View>
            )}
        </Screen>
    );
}