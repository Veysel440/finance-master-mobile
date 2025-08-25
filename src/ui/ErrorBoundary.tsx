import React from "react";
import { View, Text } from "react-native";
import { Sentry } from "@/monitoring/sentry";

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false };
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error: any, info: any) { try { Sentry.Native.captureException(error, { extra: info }); } catch {} }
    render() {
        if (this.state.hasError) {
            return (
                <View style={{ flex:1, alignItems:"center", justifyContent:"center", padding:16 }}>
                    <Text style={{ fontSize:18, fontWeight:"600" }}>Bir hata oluştu.</Text>
                    <Text style={{ marginTop:6, color:"#6b7280" }}>Uygulamayı yeniden başlatın.</Text>
                </View>
            );
        }
        return this.props.children;
    }
}