import Screen from "@/components/ui/Screen";
import { useTxSummary } from "@/features/transactions/service";
import { startOfMonth, addMonths } from "date-fns";
import { Text, ActivityIndicator } from "react-native";
import {
    VictoryChart,
    VictoryGroup,
    VictoryLine,
    VictoryLegend,
    VictoryAxis,
} from "victory-native";

type Point = { x: Date; y: number };

export default function Dashboard() {
    const from = startOfMonth(new Date());
    const to = addMonths(from, 1);
    const { data, isLoading } = useTxSummary(from.toISOString(), to.toISOString());

    if (isLoading) {
        return (
            <Screen>
                <ActivityIndicator />
            </Screen>
        );
    }

    const byType: { income: Point[]; expense: Point[] } = { income: [], expense: [] };
    (data ?? []).forEach((r) => {
        const d = new Date(r.date);
        byType[r.type].push({ x: d, y: r.total });
    });

    const noData = byType.income.length === 0 && byType.expense.length === 0;

    return (
        <Screen>
            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>Aylık Özet</Text>

            {noData ? (
                <Text style={{ opacity: 0.6 }}>Bu aralıkta veri yok.</Text>
            ) : (
                <VictoryChart domainPadding={{ x: 20 }} scale={{ x: "time" }}>
                    <VictoryAxis
                        tickFormat={(t: Date | number) => {
                            const d = t instanceof Date ? t : new Date(t);
                            return String(d.getDate());
                        }}
                    />
                    <VictoryLegend
                        x={50}
                        orientation="horizontal"
                        gutter={20}
                        data={[{ name: "Gelir" }, { name: "Gider" }]}
                    />
                    <VictoryGroup>
                        <VictoryLine data={byType.income} />
                        <VictoryLine data={byType.expense} />
                    </VictoryGroup>
                </VictoryChart>
            )}
        </Screen>
    );
}