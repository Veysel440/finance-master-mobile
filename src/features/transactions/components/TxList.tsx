import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { View, Text } from "react-native";
import { Tx } from "@/features/transactions/service";

export function TxItem({ item }: { item: Tx }) {
    return (
        <View className="px-4 py-3 border-b border-gray-200">
            <Text className="font-semibold">
                {item.type === "expense" ? "-" : "+"}{item.amount} {item.currency}
            </Text>
            <Text className="text-gray-600">{item.note || "—"}</Text>
        </View>
    );
}

export default function TxList({ data, onEnd }: { data: Tx[]; onEnd?: () => void }) {
    const render: ListRenderItem<Tx> = ({ item }) => <TxItem item={item} />;
    return (
        <FlashList<Tx>
            data={data}
            renderItem={render}
            estimatedItemSize={64}
            onEndReachedThreshold={0.2}
            onEndReached={onEnd}
            keyExtractor={(x) => String(x.id)}
        />
    );
}