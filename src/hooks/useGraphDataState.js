import { useEffect, useRef, useState } from "react";
import storedGraphData from "../../public/data/graphData.json";

const STORAGE_KEY = "map-graph";

const EMPTY_GRAPH = { version: 1, nodes: {}, edges: {} };

export default function useGraphDataState() {
    const [graphData, setGraphData] = useState(() => {
        let raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            raw = JSON.stringify(storedGraphData);
        }
        try {
            const parsed = JSON.parse(raw);
            return parsed?.nodes && parsed?.edges ? parsed : EMPTY_GRAPH;
        } catch {
            return EMPTY_GRAPH;
        }
    });

    // debounce localStorage writes
    const t = useRef(null);
    useEffect(() => {
        clearTimeout(t.current);
        t.current = setTimeout(() => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(graphData));
        }, 250);
        return () => clearTimeout(t.current);
    }, [graphData]);

    return { graphData, setGraphData };
}
