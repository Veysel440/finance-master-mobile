import { SafeAreaView } from "react-native-safe-area-context";
export default function Screen({ children }: { children: React.ReactNode }) {
    return <SafeAreaView style={{ flex:1, padding:16 }}>{children}</SafeAreaView>;
}