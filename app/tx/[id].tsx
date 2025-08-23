import Screen from "@/components/ui/Screen";
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, Platform } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTxOne, useUpdateTx, useDeleteTx } from "@/features/transactions/service";
import { useCategories, useWallets } from "@/features/catalog/service";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";
import DateTimePicker from "@react-native-community/datetimepicker";
import { buildLocalDateTimeISO } from "@/utils/datetime";

export default function TxDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data: tx, isLoading, isError } = useTxOne(id);
    const { data: wallets } = useWallets();
    const { data: catsExp } = useCategories("expense");
    const { data: catsInc } = useCategories("income");

    const [type, setType] = useState<"income" | "expense">("expense");
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState("TRY");
    const [note, setNote] = useState("");
    const [walletId, setWalletId] = useState<number | undefined>();
    const [categoryId, setCategoryId] = useState<number | undefined>();


    const [dateLocal, setDateLocal] = useState<Date>(new Date());
    const [timeLocal, setTimeLocal] = useState<Date>(new Date());
    const [showDate, setShowDate] = useState(false);
    const [showTime, setShowTime] = useState(false);

    useEffect(() => {
        if (!tx) return;
        setType(tx.type);
        setAmount(String(tx.amount));
        setCurrency(tx.currency);
        setNote(tx.note || "");
        setWalletId(tx.walletId);
        setCategoryId(tx.categoryId);
        const d = new Date(tx.occurredAt);
        setDateLocal(d);
        setTimeLocal(d);
    }, [tx]);

    const cats = useMemo(() => (type === "expense" ? (catsExp || []) : (catsInc || [])), [type, catsExp, catsInc]);

    const updateM = useUpdateTx();
    const deleteM = useDeleteTx();

    if (isLoading) {
        return (
            <Screen>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator />
                </View>
            </Screen>
        );
    }
    if (isError || !tx) {
        Toast.show({ type: "error", text1: "Kayıt bulunamadı" });
        return (
            <Screen>
                <View className="p-6">
                    <Text>Kayıt bulunamadı.</Text>
                </View>
            </Screen>
        );
    }

    const onSave = async () => {
        if (!walletId || !categoryId) {
            Toast.show({ type: "error", text1: "Cüzdan ve kategori seç" });
            return;
        }
        const occurredAt = buildLocalDateTimeISO(dateLocal, timeLocal); // TZ doğru
        const payload = { type, amount: Number(amount), currency, note, walletId, categoryId, occurredAt };
        const base = {
            amount: tx.amount,
            currency: tx.currency,
            note: tx.note ?? null,
            walletId: tx.walletId,
            categoryId: tx.categoryId,
            occurredAt: tx.occurredAt,
            updatedAt: tx.updatedAt,
        };
        await updateM.mutateAsync({ id: id!, payload, base });
        Toast.show({ type: "success", text1: "Güncellendi" });
        router.back();
    };

    const onDelete = () =>
        Alert.alert("Sil", "Bu hareket silinecek.", [
            { text: "İptal" },
            {
                text: "Sil",
                style: "destructive",
                onPress: async () => {
                    await deleteM.mutateAsync(id!);
                    Toast.show({ type: "success", text1: "Silindi" });
                    router.back();
                },
            },
        ]);

    const dateLabel = dateLocal.toLocaleDateString();
    const timeLabel = timeLocal.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return (
        <Screen>
            <View className="p-6 gap-3">
                <Text className="text-xl font-bold">Hareket #{tx.id}</Text>

                <View className="flex-row gap-3">
                    <Pressable
                        onPress={() => setType("expense")}
                        className={`px-3 py-2 rounded ${type === "expense" ? "bg-black" : "bg-gray-200"}`}>
                        <Text className={type === "expense" ? "text-white" : ""}>Gider</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setType("income")}
                        className={`px-3 py-2 rounded ${type === "income" ? "bg-black" : "bg-gray-200"}`}>
                        <Text className={type === "income" ? "text-white" : ""}>Gelir</Text>
                    </Pressable>
                </View>

                <TextInput placeholder="Tutar" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} className="border p-3 rounded" />
                <TextInput placeholder="Para birimi" value={currency} onChangeText={setCurrency} className="border p-3 rounded" />
                <TextInput placeholder="Not" value={note} onChangeText={setNote} className="border p-3 rounded" />

                <View className="flex-row gap-3">
                    <Pressable onPress={() => setShowDate(true)} className="border px-3 py-3 rounded">
                        <Text>Tarih: {dateLabel}</Text>
                    </Pressable>
                    <Pressable onPress={() => setShowTime(true)} className="border px-3 py-3 rounded">
                        <Text>Saat: {timeLabel}</Text>
                    </Pressable>
                </View>

                {showDate && (
                    <DateTimePicker
                        value={dateLocal}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(_, d) => {
                            setShowDate(Platform.OS === "android" ? false : true);
                            if (d) setDateLocal(d);
                        }}
                    />
                )}
                {showTime && (
                    <DateTimePicker
                        value={timeLocal}
                        mode="time"
                        is24Hour
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(_, d) => {
                            setShowTime(Platform.OS === "android" ? false : true);
                            if (d) setTimeLocal(d);
                        }}
                    />
                )}

                <Text className="mt-2">Cüzdan</Text>
                <View className="border rounded">
                    <Picker
                        selectedValue={walletId}
                        onValueChange={(v: number) => {
                            setWalletId(v);
                            const w = (wallets || []).find((x) => x.id === v);
                            if (w) setCurrency(w.currency);
                        }}>
                        <Picker.Item label="Seç" value={undefined as any} />
                        {(wallets || []).map((w) => (
                            <Picker.Item key={w.id} label={`${w.name} (${w.currency})`} value={w.id} />
                        ))}
                    </Picker>
                </View>

                <Text className="mt-2">Kategori</Text>
                <View className="border rounded">
                    <Picker selectedValue={categoryId} onValueChange={(v: number) => setCategoryId(v)}>
                        <Picker.Item label="Seç" value={undefined as any} />
                        {cats.map((c) => (
                            <Picker.Item key={c.id} label={c.name} value={c.id} />
                        ))}
                    </Picker>
                </View>

                <View className="flex-row justify-between mt-4">
                    <Pressable onPress={onDelete} className="border border-red-600 px-4 py-3 rounded">
                        <Text className="text-red-600">Sil</Text>
                    </Pressable>
                    <Pressable onPress={onSave} className="bg-black px-6 py-3 rounded">
                        <Text className="text-white">Kaydet</Text>
                    </Pressable>
                </View>
            </View>
        </Screen>
    );
}