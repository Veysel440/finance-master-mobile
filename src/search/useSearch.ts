import { useState } from "react";
import { useDebounced } from "@/hooks/useDebounced";
import { normalizeSearch } from "@/utils/search";

export function useSearch(initial = "", delay = 350) {
    const [term, setTerm] = useState(initial);
    const debounced = useDebounced(term, delay);
    const q = normalizeSearch(debounced);
    return { term, setTerm, q };
}