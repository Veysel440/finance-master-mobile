import Screen from "@/components/ui/Screen";
import { useTxList } from "@/features/transactions/service";
import TxList from "@/features/transactions/components/TxList";

export default function TransactionsTab(){
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useTxList("");
    const flat = (data?.pages || []).flatMap(p => p.data || []);
    return (
        <Screen>
            <TxList
                data={flat}
                onEnd={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
            />
        </Screen>
    );
}