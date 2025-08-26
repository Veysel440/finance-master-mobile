import { useState } from "react";
import { View, TextInput, Pressable, Text } from "react-native";
import { login } from "@/features/auth/service";
import { toast } from "@/ui/toast/bridge";
import { mapApiError } from "@/api/errors";
import CaptchaModal from "@/components/CaptchaModal";
import Constants from "expo-constants";
import { useAuthStore } from "@/store/auth";

export default function LoginScreen() {
    const setAuth = useAuthStore((s) => s.setAuth);
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [captchaOpen, setCaptchaOpen] = useState(false);
    const [captchaTok, setCaptchaTok] = useState<string | undefined>(undefined);

    const extra = (Constants.expoConfig?.extra || {}) as any;
    const siteKey = extra.captchaSiteKey as string;

    async function onSubmit() {
        try {
            const { token, refresh, user } = await login({ email, password: pass, captcha: captchaTok });
            setAuth(token, refresh);
            setCaptchaTok(undefined);
        } catch (e: any) {
            if (e?.response?.data?.code === "captcha_required") {
                setCaptchaOpen(true);
            } else {
                toast(mapApiError(e?.response?.data, e?.response?.status), "error");
            }
        }
    }

    return (
        <View className="flex-1 p-4 gap-3 justify-center">
            <TextInput value={email} onChangeText={setEmail} placeholder="E-posta" autoCapitalize="none" className="border p-3 rounded" />
            <TextInput value={pass} onChangeText={setPass} placeholder="Parola" secureTextEntry className="border p-3 rounded" />
            <Pressable onPress={onSubmit} className="bg-black rounded p-3"><Text className="text-white text-center">Giriş yap</Text></Pressable>

            <CaptchaModal
                visible={captchaOpen}
                siteKey={siteKey}
                baseUrl={extra.captchaBaseURL as string}
                onClose={() => setCaptchaOpen(false)}
                onToken={(tok) => { setCaptchaOpen(false); setCaptchaTok(tok); onSubmit(); }}
            />
        </View>
    );
}