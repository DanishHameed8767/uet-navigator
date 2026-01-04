import { createContext, useContext, useMemo } from "react";
import useGraphDataState from "../hooks/useGraphDataState";
const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
    const { graphData } = useGraphDataState();

    const searchableNodes = useMemo(() => {
        if (!graphData || !graphData.nodes) {
            return [];
        }
        return Object.values(graphData.nodes).filter(
            (node) => node.name && node.name.trim() !== ""
        );
    }, [graphData]);

    return (
        <SearchContext.Provider value={{ searchableNodes }}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearchData = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error("useSearchData must be used within a SearchProvider");
    }
    return context;
};
