import Screen from "@/components/ui/Screen";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/features/catalog/service";
import { View, Text, FlatList, TextInput, Pressable, Alert } from "react-native";
import { useState, useMemo } from "react";

export default function Categories(){
    const [type,setType] = useState<"income"|"expense">("expense");
    const { data } = useCategories(type);
    const createM = useCreateCategory(); const updateM = useUpdateCategory(); const deleteM = useDeleteCategory();

    const [name,setName] = useState("");
    const [editId,setEditId] = useState<number|undefined>(); const [editName,setEditName] = useState("");

    const switchType = () => setType(t=> t==="expense" ? "income" : "expense");
    const add = async ()=>{ if(!name.trim()) return; await createM.mutateAsync({ name:name.trim(), type }); setName(""); };
    const save = async ()=>{ if(!editId) return; await updateM.mutateAsync({ id:editId, name:editName.trim(), type }); setEditId(undefined); };

    const title = useMemo(()=> type==="expense"?"Gider Kategorileri":"Gelir Kategorileri", [type]);

    return (
        <Screen>
            <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xl font-bold">{title}</Text>
                <Pressable onPress={switchType} className="border px-3 py-1 rounded">
                    <Text>{type==="expense"?"Gelir'e geç":"Gider'e geç"}</Text>
                </Pressable>
            </View>

            <View className="flex-row gap-2 mb-3">
                <TextInput placeholder="Ad" value={name} onChangeText={setName} className="border p-3 rounded flex-1"/>
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
                                <Pressable onPress={save} className="bg-black px-3 rounded items-center justify-center"><Text className="text-white">Kaydet</Text></Pressable>
                            </View>
                        ) : (
                            <View className="flex-row justify-between">
                                <Text>{item.name}</Text>
                                <View className="flex-row gap-3">
                                    <Pressable onPress={()=>{ setEditId(item.id); setEditName(item.name); }}>
                                        <Text className="text-blue-600">Düzenle</Text>
                                    </Pressable>
                                    <Pressable onPress={()=>Alert.alert("Sil","Emin misin? (İlişkili hareket varsa hata alırsın)",[
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