import Screen from "@/components/ui/Screen";
import { useWallets, useCreateWallet, useUpdateWallet, useDeleteWallet } from "@/features/catalog/service";
import { View, Text, FlatList, TextInput, Pressable, Alert } from "react-native";
import { useState } from "react";

export default function Wallets(){
    const { data } = useWallets();
    const createM = useCreateWallet();
    const updateM = useUpdateWallet();
    const deleteM = useDeleteWallet();

    const [name,setName] = useState(""); const [currency,setCurrency] = useState("TRY");
    const [editId,setEditId] = useState<number|undefined>(); const [editName,setEditName] = useState(""); const [editCur,setEditCur]=useState("TRY");

    const add = async ()=>{ if(!name.trim()) return; await createM.mutateAsync({ name:name.trim(), currency }); setName(""); setCurrency("TRY"); };
    const save = async ()=>{ if(!editId) return; await updateM.mutateAsync({ id:editId, name:editName.trim(), currency:editCur }); setEditId(undefined); };

    return (
        <Screen>
            <Text className="text-xl font-bold mb-2">Cüzdanlar</Text>

            <View className="flex-row gap-2 mb-3">
                <TextInput placeholder="Ad" value={name} onChangeText={setName} className="border p-3 rounded flex-1"/>
                <TextInput placeholder="TRY" value={currency} onChangeText={setCurrency} className="border p-3 rounded w-24"/>
                <Pressable onPress={add} className="bg-black px-3 rounded items-center justify-center"><Text className="text-white">Ekle</Text></Pressable>
            </View>

            <FlatList
                data={data||[]}
                keyExtractor={i=>String(i.id)}
                renderItem={({item})=>(
                    <View className="border-b py-3">
                        {editId===item.id ? (
                            <View className="flex-row gap-2">
                                <TextInput value={editName} onChangeText={setEditName} className="border p-2 rounded flex-1"/>
                                <TextInput value={editCur} onChangeText={setEditCur} className="border p-2 rounded w-20"/>
                                <Pressable onPress={save} className="bg-black px-3 rounded items-center justify-center"><Text className="text-white">Kaydet</Text></Pressable>
                            </View>
                        ) : (
                            <View className="flex-row justify-between">
                                <Text>{item.name} ({item.currency})</Text>
                                <View className="flex-row gap-3">
                                    <Pressable onPress={()=>{ setEditId(item.id); setEditName(item.name); setEditCur(item.currency); }}>
                                        <Text className="text-blue-600">Düzenle</Text>
                                    </Pressable>
                                    <Pressable onPress={()=>Alert.alert("Sil","Emin misin?",[
                                        {text:"İptal"}, {text:"Sil", style:"destructive", onPress:()=>deleteM.mutate(item.id)}
                                    ])}>
                                        <Text className="text-red-600">Sil</Text>
                                    </Pressable>
                                </View>
                            </View>
                        )}
                    </View>
                )}
            />
        </Screen>
    );
}