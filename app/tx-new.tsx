import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useCreateTransaction } from "@/features/transactions/service";
import { router } from "expo-router";

export default function TxNew(){
    const mutate = useCreateTransaction();
    const [type,setType] = useState<"income"|"expense">("expense");
    const [amount,setAmount] = useState("");
    const [currency,setCurrency] = useState("TRY");
    const [note,setNote] = useState("");

    const submit = async () => {
        const payload = {
            type,
            amount: Number(amount),
            currency,
            categoryId: "default",
            walletId: "main",
            note,
            occurredAt: new Date().toISOString()
        };
        await mutate.mutateAsync(payload);
        router.back();
    };

    return (
        <View className="flex-1 p-6 gap-3">
            <Text className="text-xl font-bold mb-2">Yeni Hareket</Text>
            <View className="flex-row gap-4">
                <Pressable onPress={()=>setType("expense")} className={`px-3 py-2 rounded ${type==="expense"?"bg-black": "bg-gray-200"}`}>
                    <Text className={type==="expense"?"text-white":""}>Gider</Text>
                </Pressable>
                <Pressable onPress={()=>setType("income")} className={`px-3 py-2 rounded ${type==="income"?"bg-black": "bg-gray-200"}`}>
                    <Text className={type==="income"?"text-white":""}>Gelir</Text>
                </Pressable>
            </View>
            <TextInput placeholder="Tutar" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} className="border p-3 rounded"/>
            <TextInput placeholder="Para birimi" value={currency} onChangeText={setCurrency} className="border p-3 rounded"/>
            <TextInput placeholder="Not" value={note} onChangeText={setNote} className="border p-3 rounded"/>
            <Pressable onPress={submit} className="bg-black p-3 rounded items-center mt-2">
                <Text className="text-white">Kaydet</Text>
            </Pressable>
        </View>
    );
}