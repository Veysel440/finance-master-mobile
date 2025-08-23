import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert, Modal } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useCreateTx } from "@/features/transactions/service";
import { useWallets, useCategories, useCreateWallet, useCreateCategory } from "@/features/catalog/service";
import { router } from "expo-router";

export default function TxNew(){
    const [type,setType] = useState<"income"|"expense">("expense");
    const [amount,setAmount] = useState(""); const [currency,setCurrency] = useState("TRY"); const [note,setNote] = useState("");
    const [walletId,setWalletId] = useState<number|undefined>(); const [categoryId,setCategoryId] = useState<number|undefined>();
    const { data: wallets } = useWallets(); const { data: cats } = useCategories(type);
    useEffect(()=>{ setCategoryId(undefined); },[type]);

    const create = useCreateTx();
    const createWal = useCreateWallet(); const createCat = useCreateCategory();

    const [wModal,setWModal]=useState(false); const [wName,setWName]=useState(""); const [wCur,setWCur]=useState("TRY");
    const [cModal,setCModal]=useState(false); const [cName,setCName]=useState("");

    const submit = async ()=>{
        if (!walletId || !categoryId) { Alert.alert("Uyarı","Cüzdan ve kategori seç"); return; }
        await create.mutateAsync({ type, amount:Number(amount), currency, note, walletId, categoryId, occurredAt: new Date().toISOString() });
        router.back();
    };

    const quickAddWallet = async ()=>{ if(!wName.trim()) return; const w = await createWal.mutateAsync({ name:wName.trim(), currency:wCur }); setWModal(false); setWName(""); setWCur("TRY"); setWalletId(w.id); };
    const quickAddCategory = async ()=>{ if(!cName.trim()) return; const c = await createCat.mutateAsync({ name:cName.trim(), type }); setCModal(false); setCName(""); setCategoryId(c.id); };

    return (
        <View className="flex-1 p-6 gap-3">
            <Text className="text-xl font-bold">Yeni Hareket</Text>
            <View className="flex-row gap-3">
                <Pressable onPress={()=>setType("expense")} className={`px-3 py-2 rounded ${type==="expense"?"bg-black":"bg-gray-200"}`}><Text className={type==="expense"?"text-white":""}>Gider</Text></Pressable>
                <Pressable onPress={()=>setType("income")} className={`px-3 py-2 rounded ${type==="income"?"bg-black":"bg-gray-200"}`}><Text className={type==="income"?"text-white":""}>Gelir</Text></Pressable>
            </View>

            <TextInput placeholder="Tutar" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} className="border p-3 rounded"/>
            <TextInput placeholder="Para birimi" value={currency} onChangeText={setCurrency} className="border p-3 rounded"/>
            <TextInput placeholder="Not" value={note} onChangeText={setNote} className="border p-3 rounded"/>

            <View>
                <View className="flex-row justify-between items-center">
                    <Text>Cüzdan</Text>
                    <Pressable onPress={()=>setWModal(true)}><Text className="text-blue-600">＋ Ekle</Text></Pressable>
                </View>
                <Picker selectedValue={walletId} onValueChange={(v)=>setWalletId(v)}>
                    <Picker.Item label="Seç" value={undefined} />
                    {(wallets||[]).map(w=> <Picker.Item key={w.id} label={`${w.name} (${w.currency})`} value={w.id} />)}
                </Picker>
            </View>

            <View>
                <View className="flex-row justify-between items-center">
                    <Text>Kategori</Text>
                    <Pressable onPress={()=>setCModal(true)}><Text className="text-blue-600">＋ Ekle</Text></Pressable>
                </View>
                <Picker selectedValue={categoryId} onValueChange={(v)=>setCategoryId(v)}>
                    <Picker.Item label="Seç" value={undefined} />
                    {(cats||[]).map(c=> <Picker.Item key={c.id} label={c.name} value={c.id} />)}
                </Picker>
            </View>

            <Pressable onPress={submit} className="bg-black p-3 rounded items-center mt-2"><Text className="text-white">Kaydet</Text></Pressable>

            {/* Wallet Quick Add */}
            <Modal visible={wModal} transparent animationType="slide">
                <View className="flex-1 justify-end bg-black/30">
                    <View className="bg-white p-4 rounded-t-2xl gap-2">
                        <Text className="text-lg font-bold">Yeni Cüzdan</Text>
                        <TextInput placeholder="Ad" value={wName} onChangeText={setWName} className="border p-3 rounded"/>
                        <TextInput placeholder="TRY" value={wCur} onChangeText={setWCur} className="border p-3 rounded"/>
                        <View className="flex-row justify-end gap-3">
                            <Pressable onPress={()=>setWModal(false)}><Text>İptal</Text></Pressable>
                            <Pressable onPress={quickAddWallet}><Text className="text-blue-600">Ekle</Text></Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Category Quick Add */}
            <Modal visible={cModal} transparent animationType="slide">
                <View className="flex-1 justify-end bg-black/30">
                    <View className="bg-white p-4 rounded-t-2xl gap-2">
                        <Text className="text-lg font-bold">Yeni Kategori ({type})</Text>
                        <TextInput placeholder="Ad" value={cName} onChangeText={setCName} className="border p-3 rounded"/>
                        <View className="flex-row justify-end gap-3">
                            <Pressable onPress={()=>setCModal(false)}><Text>İptal</Text></Pressable>
                            <Pressable onPress={quickAddCategory}><Text className="text-blue-600">Ekle</Text></Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}