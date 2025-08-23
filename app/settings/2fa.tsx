import Screen from "@/components/ui/Screen";
import { View, Text, Pressable, TextInput, Alert } from "react-native";
import { useState } from "react";
import QRCode from "react-native-qrcode-svg";
import { totpSetup, totpConfirm } from "@/features/auth/totp";
import { useAuthStore } from "@/store/auth";

export default function TwoFA(){
    const email = useAuthStore(s=>s.user?.email || "");
    const [otpauth,setOtpauth] = useState<string|undefined>();
    const [secret,setSecret] = useState<string|undefined>();
    const [code,setCode] = useState("");

    const setup = async ()=>{
        try{
            const r = await totpSetup(email);
            setSecret(r.secret); setOtpauth(r.otpauth);
        }catch{ Alert.alert("Hata","TOTP setup başarısız"); }
    };
    const confirm = async ()=>{
        try{ await totpConfirm(code); Alert.alert("Tamam","TOTP etkin"); }
        catch{ Alert.alert("Hata","Kod yanlış"); }
    };

    return (
        <Screen>
            <View className="gap-4">
                {!otpauth ? (
                    <>
                        <Text className="text-lg font-bold">İki Aşamalı Doğrulama</Text>
                        <Pressable onPress={setup} className="bg-black px-4 py-3 rounded"><Text className="text-white">Kurulum Başlat</Text></Pressable>
                    </>
                ) : (
                    <>
                        <Text>Authenticator uygulamasında QR'ı tara veya gizli anahtarı gir.</Text>
                        <View className="items-center my-3">{ otpauth ? <QRCode value={otpauth} size={180}/> : null }</View>
                        <Text>Gizli Anahtar: {secret}</Text>
                        <TextInput placeholder="6 haneli kod" keyboardType="number-pad" value={code} onChangeText={setCode} className="border p-3 rounded"/>
                        <Pressable onPress={confirm} className="bg-black px-4 py-3 rounded"><Text className="text-white">Onayla</Text></Pressable>
                    </>
                )}
            </View>
        </Screen>
    );
}