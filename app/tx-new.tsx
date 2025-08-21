import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useCreateTx } from "@/features/transactions/service";
import { useWallets, useCategories } from "@/features/catalog/service";
import { router } from "expo-router";

export default function TxNew() {
    const [type, setType] = useState<"income" | "expense">("expense");
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState("TRY");
    const [note, setNote] = useState("");
    const [walletId, setWalletId] = useState<number | undefined>();
    const [categoryId, setCategoryId] = useState<number | undefined>();

    const { data: wallets } = useWallets();
    const { data: cats } = useCategories(type);
    useEffect(() => { setCategoryId(undefined); }, [type]);

    const create = useCreateTx();

    const submit = async () => {
        if (!walletId || !categoryId) {
            Alert.alert("Uyarı", "Cüzdan ve kategori seç");
            return;
        }
        await create.mutateAsync({
            type,
            amount: Number(amount || 0),
            currency,
            note,
            walletId,
            categoryId,
            occurredAt: new Date().toISOString(),
        });
        router.back();
    };

    return (
        <View className="flex-1 p-6 gap-3">
            <Text className="text-xl font-bold">Yeni Hareket</Text>

            <View className="flex-row gap-3">
                <Pressable
                    onPress={() => setType("expense")}
                    className={`px-3 py-2 rounded ${type === "expense" ? "bg-black" : "bg-gray-200"}`}
                >
                    <Text className={type === "expense" ? "text-white" : ""}>Gider</Text>
                </Pressable>
                <Pressable
                    onPress={() => setType("income")}
                    className={`px-3 py-2 rounded ${type === "income" ? "bg-black" : "bg-gray-200"}`}
                >
                    <Text className={type === "income" ? "text-white" : ""}>Gelir</Text>
                </Pressable>
            </View>

            <TextInput
                placeholder="Tutar"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                className="border p-3 rounded"
            />
            <TextInput
                placeholder="Para birimi"
                value={currency}
                onChangeText={setCurrency}
                className="border p-3 rounded"
            />
            <TextInput
                placeholder="Not"
                value={note}
                onChangeText={setNote}
                className="border p-3 rounded"
            />

            <Text>Cüzdan</Text>
            <Picker<number | null>
                selectedValue={walletId ?? null}
                onValueChange={(v: number | null) => setWalletId(v ?? undefined)}
            >
                <Picker.Item label="Seç" value={null} />
                {(wallets ?? []).map((w) => (
                    <Picker.Item key={w.id} label={`${w.name} (${w.currency})`} value={w.id} />
                ))}
            </Picker>

            <Text>Kategori</Text>
            <Picker<number | null>
                selectedValue={categoryId ?? null}
                onValueChange={(v: number | null) => setCategoryId(v ?? undefined)}
            >
                <Picker.Item label="Seç" value={null} />
                {(cats ?? []).map((c) => (
                    <Picker.Item key={c.id} label={c.name} value={c.id} />
                ))}
            </Picker>

            <Pressable onPress={submit} className="bg-black p-3 rounded items-center mt-2">
                <Text className="text-white">Kaydet</Text>
            </Pressable>
        </View>
    );
}