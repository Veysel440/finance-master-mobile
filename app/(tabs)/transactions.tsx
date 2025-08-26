import Screen from "@/components/ui/Screen";
import SearchBar from "@/components/SearchBar";
import TxList from "@/features/transactions/components/TxList";
import { useSearch } from "@/search/useSearch";

import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { listTx, type Tx, type TxPage } from "@/features/transactions/service";

export default function TxPage() {
    const { term, setTerm, q } = useSearch("", 400);

    const qry = useInfiniteQuery<
        TxPage,
        Error,
        InfiniteData<TxPage, number>,
        readonly ["tx.list", string],
        number
    >({
        queryKey: ["tx.list", q] as const,
        initialPageParam: 1,
        queryFn: ({ pageParam }) => listTx({ page: pageParam, size: 20, q }),
        getNextPageParam: (last, all, lastParam) => {
            const loaded = all.reduce((n, p) => n + (p.data?.length ?? 0), 0);
            return loaded < (last.total ?? 0) ? lastParam + 1 : undefined;
        },
    });

    const flat: Tx[] = (qry.data?.pages ?? []).flatMap((p: TxPage) => p.data);

    return (
        <Screen>
            <SearchBar
                value={term}
                onChangeText={setTerm}
                placeholder='Ara…  (Tam metin: "ft:market")'
            />
            <TxList
                data={flat}
                onEnd={() => { if (qry.hasNextPage) qry.fetchNextPage(); }}
            />
        </Screen>
    );
}