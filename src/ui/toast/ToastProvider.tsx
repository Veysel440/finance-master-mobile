import React, { createContext, useContext, useRef, useState } from "react";
import { Animated, Easing, Text, View } from "react-native";

type ToastType = "error" | "success" | "info";
type ToastCtx = { show: (msg: string, type?: ToastType) => void };
const Ctx = createContext<ToastCtx>({ show: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [msg, setMsg] = useState<string>("");
    const [type, setType] = useState<ToastType>("info");
    const anim = useRef(new Animated.Value(0)).current;

    const show = (m: string, t: ToastType = "info") => {
        setMsg(m);
        setType(t);
        Animated.sequence([
            Animated.timing(anim, { toValue: 1, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.delay(2200),
            Animated.timing(anim, { toValue: 0, duration: 180, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        ]).start();
    };

    const bg = type === "error" ? "#ef4444" : type === "success" ? "#22c55e" : "#374151";

    return (
        <Ctx.Provider value={{ show }}>
            {children}
            <Animated.View
                pointerEvents="none"
                style={{
                    position: "absolute",
                    left: 16,
                    right: 16,
                    bottom: 32,
                    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
                    opacity: anim,
                }}
            >
                {!!msg && (
                    <View style={{ backgroundColor: bg, padding: 12, borderRadius: 10 }}>
                        <Text style={{ color: "white", fontWeight: "600" }}>{msg}</Text>
                    </View>
                )}
            </Animated.View>
        </Ctx.Provider>
    );
}

export function useToast() { return useContext(Ctx); }