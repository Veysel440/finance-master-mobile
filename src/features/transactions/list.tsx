import { useMemo, useState, useEffect } from "react";
import { View, TextInput, FlatList, Text, ActivityIndicator } from "react-native";
import { useTxList, type Tx } from "./service";
import Screen from "@/components/ui/Screen";
import debounce from "lodash.debounce";

export default function TxList() {
    const [search, setSearch] = useState("");
    const [q, setQ] = useState("");

    const debounced = useMemo(() => debounce((s: string) => setQ(s), 400), []);
    useEffect(() => () => debounced.cancel(), [debounced]);

    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
    } = useTxList(q);

    const items: Tx[] =
        ((data?.pages as Array<{ data: Tx[] }> | undefined)?.flatMap((p) => p.data)) ?? [];

    return (
        <Screen>
            <TextInput
                placeholder="Ara..."
                value={search}
                onChangeText={(s) => {
                    setSearch(s);
                    debounced(s);
                }}
                className="border p-3 rounded mb-3"
            />

            <FlatList<Tx>
                data={items}
                keyExtractor={(x) => String(x.id)}
                onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
                onEndReachedThreshold={0.6}
                refreshing={isLoading}
                onRefresh={() => { refetch(); }}
                renderItem={({ item }) => (
                    <View className="flex-row justify-between py-3 border-b">
                        <Text>{item.type === "income" ? "➕" : "➖"} {item.note ?? "-"}</Text>
                        <Text>{item.amount} {item.currency}</Text>
                    </View>
                )}
                ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
            />
        </Screen>
    );
}