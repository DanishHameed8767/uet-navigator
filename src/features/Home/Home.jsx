import styles from "./Home.module.css";
import { useState, useRef, useMemo, useEffect } from "react";
import SearchBar from "../../components/SearchBar/SearchBar.jsx";
import SearchList from "../../components/SearchList/SearchList.jsx";
import MapCanvas from "../MapCanvas/MapCanvas.jsx";

import SingleLinkedList from "../../data-structures/linkedList.js";
import useGraphDataState from "../../hooks/useGraphDataState.js";
import { hydrateGraph } from "../../data-structures/graph";
import useLocalStorage from "../../hooks/useLocalStorage.js";
import {
    getDistance,
    pixelToLatLon,
    resolveNameType,
    resolveNear,
} from "../../utils/mapHelper.js";
import { useSearchData } from "../../context/SearchContext.jsx";

const Home = ({ currentUser, searchMode, setSearchMode, openLogin }) => {
    const searchInputRef = useRef(null);
    const searchWrapperRef = useRef(null);

    const [stops, setStops] = useState([]);
    const [searchKey, setSearchKey] = useState("");
    const [isSearchFocus, setSearchFocus] = useState(false);
    const [searchResult, setSearchResult] = useState(null);
    const [searchResultLimit, setSearchResultLimit] = useState(5);
    const { searchableNodes } = useSearchData();

    const { graphData, setGraphData } = useGraphDataState();
    const hydrated = useMemo(() => hydrateGraph(graphData), [graphData]);
    const [savedStops, setSavedStops] = useLocalStorage("saved_stops", []);
    const [recentPaths, setRecentPaths] = useLocalStorage("recent_paths", []);

    useEffect(() => {
        setSearchResultLimit(5);
        if (searchMode !== "default") {
            searchInputRef.current?.focus();
        }
    }, [searchMode]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchWrapperRef.current &&
                !searchWrapperRef.current.contains(event.target)
            ) {
                setSearchFocus(false);
                setSearchKey("");
                setSearchResult(null);
                setSearchMode("default");
                setSearchResultLimit(5);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [setSearchMode]);

    useEffect(() => {
        if (!isSearchFocus || searchKey.length === 0) {
            if (searchMode === "default") {
                setSearchResult(null);
            }
            return;
        }

        if (searchMode === "default") {
            const list = new SingleLinkedList();
            const query = searchKey.toLowerCase();

            // High-performance search on the pre-filtered named nodes
            const matches = searchableNodes.filter(
                (node) =>
                    node.name.toLowerCase().includes(query) ||
                    node.type.toLowerCase().includes(query)
            );

            // Append the top 10 results to your UI list
            matches.slice(0, 10).forEach((node) => {
                list.append({
                    ...node,
                    name: node.name,
                    near: node.type,
                });
            });

            setSearchResult(list);
        }
    }, [searchKey, isSearchFocus, searchMode, searchableNodes]);

    const handlePathVisit = () => {
        if (stops.length === 0) {
            return;
        }
        const pathNodes = stops.map((stop) => {
            const { lat: currentLat, lon: currentLon } = pixelToLatLon(
                stop.point.x,
                stop.point.y
            );
            const graphNodesArray = Object.values(hydrated.graph.nodes);
            const matchedGraphNode = graphNodesArray.find(
                (node) => node.lat === currentLat && node.lon === currentLon
            );
            return {
                id: matchedGraphNode?.id || "",
                lat: currentLat,
                lon: currentLon,
                name: matchedGraphNode?.name || "",
                type: matchedGraphNode?.type || "custom",
                tier: matchedGraphNode?.tier || "",
            };
        });

        // 2. Check for Duplicates BEFORE updating state
        // We look at the current 'recentPaths' state directly
        const lastVisit = recentPaths.find(
            (visit) => visit.email === currentUser?.email
        );

        if (lastVisit) {
            const isSamePath =
                JSON.stringify(lastVisit.nodes) === JSON.stringify(pathNodes);
            const lastTime = new Date(lastVisit.timestamp).getTime();
            const currentTime = new Date().getTime();
            const minutesPassed = (currentTime - lastTime) / (1000 * 60);

            if (isSamePath && minutesPassed < 10) {
                alert(
                    `This path was already recorded ${Math.round(minutesPassed)} minutes ago.`
                );
                return; // EXIT the function here; nothing else runs
            }
        }

        // 3. Build the entry object
        const newRecentEntry = {
            email: currentUser?.email || "",
            timestamp: new Date().toISOString(),
            nodes: pathNodes,
        };

        // 4. If we reached this point, it means the check passed
        setRecentPaths((prev) => {
            const updatedRecents = [newRecentEntry, ...prev];
            return updatedRecents.slice(0, 10);
        });

        // 5. Success Alert only runs if the duplicate check didn't trigger 'return'
        alert("Path added to recent visits");
    };

    const handleStopSave = (stop) => {
        if (!currentUser) {
            openLogin();
            return;
        }
        if (!stop?.snap?.node) {
            return;
        }
        alert("Saving stop...");
        setSavedStops((prev) => {
            const minDistThreshold = 10;
            const tooClose = prev.some((s) => {
                if (!s?.snap?.node || s.email !== currentUser?.email) {
                    return false;
                }
                const dist = getDistance(
                    stop.snap.node.lat,
                    stop.snap.node.lon,
                    s.snap?.node?.lat,
                    s.snap?.node?.lon
                );
                return dist < minDistThreshold;
            });
            if (tooClose) {
                alert(
                    `This location is too close to an already saved point (less than ${minDistThreshold}m).`
                );
                return prev;
            }
            const newSave = { ...stop, email: currentUser?.email };
            alert("Successfully saved: ", newSave);
            return [...prev, newSave];
        });
    };

    const loadSavedByUser = (email, savedStops, limit) => {
        const list = new SingleLinkedList();
        const userStops = savedStops.filter((stop) => stop.email === email);
        const paginatedStops = userStops.slice(0, limit);
        paginatedStops.forEach((stop) => {
            list.append(stop);
        });
        list.hasMore = userStops.length > limit;
        return list;
    };

    const loadRecents = (email, recentPaths, limit) => {
        const list = new SingleLinkedList();

        // Filter ONLY by user email
        const userRecents = recentPaths.filter((path) => path.email === email);

        // Paginate and map nodes for RecentCard display
        const paginatedRecents = userRecents.slice(0, limit);
        paginatedRecents.forEach((path) => {
            if (path.nodes && path.nodes.length >= 2) {
                const start = path.nodes[0];
                const end = path.nodes[path.nodes.length - 1];
                list.append({
                    timestamp: path.timestamp,
                    type: "recent-path",
                    pathData: path.nodes,
                    startNode: {
                        name: start.name || "Unnamed",
                        near: start.type,
                        type: start.type,
                    },
                    endNode: {
                        name: end.name || "Unnamed",
                        near: end.type,
                        type: end.type,
                    },
                });
            }
        });

        list.hasMore = userRecents.length > limit;
        return list;
    };

    useEffect(() => {
        if (searchMode === "default") {
            setSearchResult(null);
            return;
        }
        if (searchMode === "saved") {
            setSearchResult(
                loadSavedByUser(
                    currentUser?.email,
                    savedStops,
                    searchResultLimit
                )
            );
        }
        if (searchMode === "recents") {
            setSearchResult(
                loadRecents(currentUser?.email, recentPaths, searchResultLimit)
            );
        }
    }, [
        searchMode,
        currentUser?.email,
        savedStops,
        recentPaths,
        searchResultLimit,
    ]);

    console.log(searchResult);

    return (
        <div className={styles.home}>
            <MapCanvas
                currentUser={currentUser}
                graphData={graphData}
                setGraphData={setGraphData}
                graph={hydrated.graph}
                renderNodes={hydrated.render.nodes}
                renderEdges={hydrated.render.edges}
                indexes={hydrated.indexes}
                stops={stops}
                setStops={setStops}
                handleStopSave={handleStopSave}
                handlePathVisit={handlePathVisit}
            />

            <div ref={searchWrapperRef} className={styles["search-container"]}>
                <SearchBar
                    searchKey={searchKey}
                    setKey={setSearchKey}
                    inputRef={searchInputRef}
                    onFocus={() => setSearchFocus(true)}
                    isActive={isSearchFocus}
                    onChange={() => {
                        if (
                            searchMode === "saved" ||
                            searchMode === "recents"
                        ) {
                            // 1. Switch mode first
                            setSearchMode("default");

                            // 2. Capture the character and force it into the key
                            setSearchKey((prev) => {
                                const typedChar = prev.charAt(prev.length - 1);
                                return typedChar;
                            });
                        }
                    }}
                />

                {isSearchFocus && (
                    <SearchList
                        result={searchResult}
                        mode={searchMode}
                        key={searchKey}
                        nodes={hydrated.graph.nodes}
                        adjacency={hydrated.graph.adjacency}
                        nodeLookup={graphData.nodes}
                        onSeeMore={() =>
                            setSearchResultLimit((prev) => prev + 5)
                        }
                    />
                )}
            </div>
        </div>
    );
};

export default Home;
