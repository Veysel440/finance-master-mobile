import Screen from "@/components/ui/Screen";
import { View, Text, Pressable, ActivityIndicator, FlatList } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listSessions, revokeSession, SessionRow } from "@/features/auth/service";
import { format } from "@/utils/datetime";
import { toast } from "@/ui/toast/bridge";

export default function Sessions() {
    const qc = useQueryClient();
    const q = useQuery({ queryKey: ["auth.sessions"], queryFn: listSessions });
    const m = useMutation({
        mutationFn: (id: number) => revokeSession(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["auth.sessions"] }); toast("Oturum iptal edildi"); },
        onError: () => toast("İşlem başarısız", "error"),
    });

    const render = ({ item }: { item: SessionRow }) => (
        <View className="border rounded p-3 mb-2">
            <Text className="font-bold">#{item.id}</Text>
            <Text>UA: {item.ua || "-"}</Text>
            <Text>IP: {item.ip || "-"}</Text>
            <Text>Oluşturma: {format(item.createdAt)}</Text>
            <Text>Son kullanım: {format(item.lastUsedAt)}</Text>
            <Text>Geçerlilik: {format(item.expiresAt)}</Text>
            <Pressable onPress={() => m.mutate(item.id)} className="bg-black px-3 py-2 rounded mt-2">
                <Text className="text-white text-center">İptal et</Text>
            </Pressable>
        </View>
    );

    return (
        <Screen>
            {q.isLoading ? <ActivityIndicator /> :
                <FlatList data={q.data || []} keyExtractor={(x) => String(x.id)} renderItem={render} />}
        </Screen>
    );
}