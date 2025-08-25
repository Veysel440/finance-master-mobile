import { View, Text, Pressable } from "react-native";

export function ConflictBanner({ onResolveClient, onResolveServer }: { onResolveClient: ()=>void; onResolveServer: ()=>void }) {
    return (
        <View className="bg-yellow-100 border border-yellow-400 rounded p-3 my-2">
            <Text className="text-yellow-900 mb-2">Çatışma algılandı. Hangisini saklamak istersin?</Text>
            <View className="flex-row gap-2">
                <Pressable onPress={onResolveClient} className="bg-black px-3 py-2 rounded">
                    <Text className="text-white">Benim Değişiklik</Text>
                </Pressable>
                <Pressable onPress={onResolveServer} className="border px-3 py-2 rounded">
                    <Text>Sunucudakini Al</Text>
                </Pressable>
            </View>
        </View>
    );
}