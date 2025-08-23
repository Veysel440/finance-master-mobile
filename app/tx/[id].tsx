import { useLocalSearchParams, router } from "expo-router";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useEffect, useState } from "react";
import { useCategories, useWallets } from "@/features/catalog/service";
import { useUpdateTx, useDeleteTx } from "@/features/transactions/service";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Picker } from "@react-native-picker/picker";

export default function TxDetail(){
    const { id } = useLocalSearchParams<{id:string}>();
    const { data: wallets } = useWallets();
    const { data: catsExp } = useCategories("expense");
    const { data: catsInc } = useCategories("income");

    const { data: txDetail } = useQuery({
        queryKey:["tx.one", id],
        enabled: !!id,
        queryFn: async()=> (await api.get(`/v1/transactions/${id}`)).data as {
            id:number; type:"income"|"expense"; amount:number; currency:string; note?:string|null;
            walletId:number; categoryId:number; occurredAt:string;
        }
    });

    const [type,setType] = useState<"income"|"expense">("expense");
    const [amount,setAmount] = useState(""); const [currency,setCurrency] = useState("TRY"); const [note,setNote] = useState("");
    const [walletId,setWalletId] = useState<number|undefined>(); const [categoryId,setCategoryId] = useState<number|undefined>();

    useEffect(()=>{
        if (!txDetail) return;
        setType(txDetail.type);
        setAmount(String(txDetail.amount));
        setCurrency(txDetail.currency);
        setNote(txDetail.note || "");
        setWalletId(txDetail.walletId);
        setCategoryId(txDetail.categoryId);
    }, [txDetail]);

    const updateM = useUpdateTx();
    const deleteM = useDeleteTx();

    const save = async ()=>{
        if (!walletId || !categoryId) { Alert.alert("Uyarı","Cüzdan ve kategori seç"); return; }
        await updateM.mutateAsync({
            id: id!,
            payload: { type, amount:Number(amount), currency, note, walletId, categoryId, occurredAt: new Date().toISOString() }
        });
        router.back();
    };
    const remove = async ()=>{
        Alert.alert("Sil","Bu hareket silinecek.",[
            { text:"İptal" },
            { text:"Sil", style:"destructive", onPress: async ()=>{ await deleteM.mutateAsync(id!); router.back(); } }
        ]);
    };

    const cats = type==="expense" ? (catsExp||[]) : (catsInc||[]);

    return (
        <View className="flex-1 p-6 gap-3">
            <Text className="text-xl font-bold">Hareket #{String(id)}</Text>
            <View className="flex-row gap-3">
                <Pressable onPress={()=>setType("expense")} className={`px-3 py-2 rounded ${type==="expense"?"bg-black":"bg-gray-200"}`}><Text className={type==="expense"?"text-white":""}>Gider</Text></Pressable>
                <Pressable onPress={()=>setType("income")} className={`px-3 py-2 rounded ${type==="income"?"bg-black":"bg-gray-200"}`}><Text className={type==="income"?"text-white":""}>Gelir</Text></Pressable>
            </View>

            <TextInput placeholder="Tutar" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} className="border p-3 rounded"/>
            <TextInput placeholder="Para birimi" value={currency} onChangeText={setCurrency} className="border p-3 rounded"/>
            <TextInput placeholder="Not" value={note} onChangeText={setNote} className="border p-3 rounded"/>

            <Text>Cüzdan</Text>
            <Picker selectedValue={walletId} onValueChange={(v)=>{ setWalletId(v); const w=(wallets||[]).find(x=>x.id===v); if (w) setCurrency(w.currency); }}>
                <Picker.Item label="Seç" value={undefined} />
                {(wallets||[]).map(w=> <Picker.Item key={w.id} label={`${w.name} (${w.currency})`} value={w.id} />)}
            </Picker>

            <Text>Kategori</Text>
            <Picker selectedValue={categoryId} onValueChange={(v)=>setCategoryId(v)}>
                <Picker.Item label="Seç" value={undefined} />
                {cats.map(c=> <Picker.Item key={c.id} label={c.name} value={c.id} />)}
            </Picker>

            <View className="flex-row justify-between mt-2">
                <Pressable onPress={remove} className="border border-red-600 px-4 py-3 rounded"><Text className="text-red-600">Sil</Text></Pressable>
                <Pressable onPress={save} className="bg-black px-6 py-3 rounded"><Text className="text-white">Kaydet</Text></Pressable>
            </View>
        </View>
    );
}