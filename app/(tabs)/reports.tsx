import Screen from "@/components/ui/Screen";
import { useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTxSummary } from "@/features/transactions/service";
import { VictoryChart, VictoryGroup, VictoryLine, VictoryLegend, VictoryAxis } from "victory-native";
import { format, addDays } from "date-fns";
import { useSettings } from "@/store/settings";

export default function Reports(){
    const [from, setFrom] = useState(new Date(Date.now() - 6*24*3600*1000));
    const [to, setTo] = useState(addDays(new Date(), 1));
    const [showF,setShowF] = useState(false);
    const [showT,setShowT] = useState(false);

    const { baseCurrency } = useSettings();

    const { data, isLoading } = useTxSummary(from.toISOString(), to.toISOString());
    const byType = { income: [] as any[], expense: [] as any[] };
    (data||[]).forEach(r=>{
        const d = new Date(r.date);
        byType as any;
        (byType as any)[r.type].push({ x: d, y: r.total });
    });

    return (
        <Screen>
            <Text className="text-xl font-bold mb-2">Raporlar ({baseCurrency})</Text>

            <View className="flex-row gap-3 mb-2">
                <Pressable onPress={()=>setShowF(true)} className="border px-3 py-2 rounded">
                    <Text>Başlangıç: {format(from,"yyyy-MM-dd")}</Text>
                </Pressable>
                <Pressable onPress={()=>setShowT(true)} className="border px-3 py-2 rounded">
                    <Text>Bitiş: {format(to,"yyyy-MM-dd")}</Text>
                </Pressable>
            </View>

            {showF && (
                <DateTimePicker value={from} mode="date" onChange={(_,d)=>{ setShowF(Platform.OS==="ios"); if(d) setFrom(d); }} />
            )}
            {showT && (
                <DateTimePicker value={to} mode="date" onChange={(_,d)=>{ setShowT(Platform.OS==="ios"); if(d) setTo(d); }} />
            )}

            {isLoading ? <Text>Yükleniyor...</Text> :
                <VictoryChart domainPadding={{ x: 20 }}>
                    <VictoryAxis tickFormat={(t)=> `${t.getMonth()+1}/${t.getDate()}`} />
                    <VictoryLegend x={40} orientation="horizontal" gutter={20} data={[{name:"Gelir"},{name:"Gider"}]} />
                    <VictoryGroup>
                        <VictoryLine data={byType.income}/>
                        <VictoryLine data={byType.expense}/>
                    </VictoryGroup>
                </VictoryChart>
            }
        </Screen>
    );
}