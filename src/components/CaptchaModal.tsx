import React, { useRef } from "react";
import { Modal, View, Text, Pressable } from "react-native";
import HCaptcha from "react-native-hcaptcha";

type Props = {
    visible: boolean;
    onClose: () => void;
    onToken: (token: string) => void;
    siteKey: string;
    baseUrl: string;
};

export default function CaptchaModal({ visible, onClose, onToken, siteKey, baseUrl }: Props) {
    const ref = useRef<HCaptcha>(null);

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
            <View className="flex-1 bg-black/40 justify-end">
                <View className="bg-white p-4 rounded-t-2xl">
                    <Text className="text-lg mb-2">Güvenlik doğrulaması</Text>

                    <HCaptcha
                        ref={ref}
                        siteKey={siteKey}
                        baseUrl={baseUrl}
                        size="invisible"
                        onMessage={(e) => {
                            const tok = e?.nativeEvent?.data;
                            if (tok) onToken(tok);
                        }}
                        onError={onClose}
                    />

                    <Pressable onPress={() => ref.current?.show()} className="bg-black rounded px-4 py-3 mt-2">
                        <Text className="text-white text-center">Doğrula</Text>
                    </Pressable>
                    <Pressable onPress={onClose} className="px-4 py-3 mt-1">
                        <Text className="text-center">İptal</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}