import { View, TextInput, Pressable, Text } from "react-native";

export default function SearchBar({
                                      value, onChangeText, placeholder = "Ara…",
                                  }: { value: string; onChangeText: (s: string) => void; placeholder?: string }) {
    return (
        <View className="flex-row items-center gap-2 mb-2">
            <TextInput
                accessibilityLabel="Arama"
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                className="flex-1 border rounded px-3 py-2"
                autoCapitalize="none"
                returnKeyType="search"
            />
            {value?.length ? (
                <Pressable onPress={() => onChangeText("")} className="px-3 py-2">
                    <Text>Temizle</Text>
                </Pressable>
            ) : null}
        </View>
    );
}