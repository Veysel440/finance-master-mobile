import { useTransactions } from "./service";
import { FlatList, Text, View, RefreshControl, Pressable } from "react-native";
import { useState } from "react";
import { router } from "expo-router";

export default function TxList() {
    const [page, setPage] = useState(1);
    const q = "";
    const { data, isLoading, refetch, isRefetching } = useTransactions({ page, q });

    const items = data?.data ?? [];
    return (
        <View className="flex-1 p-4">
            <FlatList
                data={items}
                keyExtractor={(x)=>String(x.id)}
                renderItem={({item})=>(
                    <View className="flex-row justify-between py-3 border-b">
                        <Text>{item.type === "income" ? "➕" : "➖"} {item.note || "-"}</Text>
                        <Text>{item.amount} {item.currency}</Text>
                    </View>
                )}
                refreshControl={<RefreshControl refreshing={isRefetching || isLoading} onRefresh={refetch} />}
                onEndReached={()=> setPage(p=>p+1)}
            />
            <Pressable onPress={()=>router.push("/tx-new")} className="absolute bottom-6 right-6 bg-black rounded-full px-5 py-3">
                <Text className="text-white text-lg">＋</Text>
            </Pressable>
        </View>
    );
}