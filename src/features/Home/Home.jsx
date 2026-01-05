import styles from "./Home.module.css";
import { useState, useRef, useMemo, useEffect } from "react";
import SearchBar from "../../components/SearchBar/SearchBar.jsx";
import SearchList from "../../components/SearchList/SearchList.jsx";
import MapCanvas from "../MapCanvas/MapCanvas.jsx";

import SingleLinkedList from "../../data-structures/linkedList.js";
import useGraphDataState from "../../hooks/useGraphDataState.js";
import { hydrateGraph } from "../../data-structures/graph";
import useLocalStorage from "../../hooks/useLocalStorage.js";
import { getDistance, resolveNear } from "../../utils/mapHelper.js";
import { useSearchData } from "../../context/SearchContext.jsx";
import CustomStack from "../../data-structures/stack.js";

const Home = ({ currentUser, searchMode, setSearchMode, openLogin }) => {
    const searchInputRef = useRef(null);
    const searchWrapperRef = useRef(null);

    const [travelMode, setTravelMode] = useState("car");
    const [selectedRoute, setSelectedRoute] = useState("shortest");
    const [pointInfo, setPointInfo] = useState(null);
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

    // --- Search & Data Loading Logic ---

    useEffect(() => {
        if (!isSearchFocus && searchMode === "default") {
            setSearchResult(null);
            return;
        }

        if (searchMode === "default" && searchKey.length > 0) {
            const list = new SingleLinkedList();
            const query = searchKey.toLowerCase();

            const matches = searchableNodes.filter(
                (node) =>
                    node.name.toLowerCase().includes(query) ||
                    node.type.toLowerCase().includes(query)
            );
            matches.slice(0, 10).forEach((node) => {
                const stop = {
                    snap: {
                        node: node,
                    },
                };
                const near =
                    resolveNear(stop, node.name, hydrated.render.nodes) ||
                    "not found";
                list.append({ ...node, near });
            });
            setSearchResult(list);
        }

        if (searchMode === "saved") {
            const list = new SingleLinkedList();
            const userStops = savedStops.filter(
                (bundle) => bundle.email === currentUser?.email
            );
            userStops.slice(0, searchResultLimit).forEach((bundle) => {
                list.append(bundle);
            });
            list.hasMore = userStops.length > searchResultLimit;
            setSearchResult(list);
        }

        if (searchMode === "recents") {
            const stack = new CustomStack();
            const userRecents = recentPaths.filter(
                (bundle) => bundle.email === currentUser?.email
            );
            userRecents.slice(0, searchResultLimit).forEach((bundle) => {
                stack.push(bundle);
            });
            setSearchResult(stack);
        }
    }, [
        searchKey,
        isSearchFocus,
        searchMode,
        searchableNodes,
        currentUser,
        savedStops,
        recentPaths,
        searchResultLimit,
        hydrated.render.nodes,
    ]);

    // --- Interaction Handlers ---

    const handleSearchResultClick = (item) => {
        if (searchMode === "default") {
            setPointInfo({
                stop: {
                    click: { x: item.x, y: item.y },
                    snap: { node: item },
                },
                info: {
                    name: item.name,
                    near: item.near,
                    lat: item.lat,
                    lon: item.lon,
                    imageUrl: ".",
                },
            });
        } else if (searchMode === "saved") {
            if (item.stop) {
                setStops((prev) => {
                    const exists = prev.some(
                        (s) =>
                            s.click.x === item.stop.click.x &&
                            s.click.y === item.stop.click.y
                    );
                    return exists ? prev : [...prev, item.stop];
                });
            }
        } else if (searchMode === "recents") {
            if (item.stops) {
                setStops(item.stops);
                setTravelMode(item.travelMode || "car");
                setSelectedRoute(item.selectedRoute || "shortest");
            }
        }
        setSearchFocus(false);
    };

    const handlePathVisit = ({
        stops,
        routeResult,
        selectedRoute,
        travelMode,
    }) => {
        if (!currentUser) {
            openLogin();
            return;
        }
        if (!stops || stops.length === 0) {
            return;
        }

        const newRecentBundle = {
            email: currentUser?.email || "",
            timestamp: new Date().toISOString(),
            stops: stops,
            selectedRoute: selectedRoute,
            routeResult: routeResult,
            travelMode: travelMode,
        };

        setRecentPaths((prev) => {
            const updatedRecents = [newRecentBundle, ...prev];
            return updatedRecents.slice(0, 10);
        });

        alert("Route added to recent visits");
        setStops([]);
        setTravelMode("car");
        setSelectedRoute("shortest");
    };

    const handleStopSave = (stop) => {
        if (!currentUser) {
            openLogin();
            return;
        }
        if (!stop?.snap?.node) {
            return;
        }

        setSavedStops((prev) => {
            const minDistThreshold = 10;
            const tooClose = prev.some((bundle) => {
                if (bundle.email !== currentUser?.email) {
                    return false;
                }
                const s = bundle.Stop;
                if (!s?.snap?.node) {
                    return false;
                }
                const dist = getDistance(
                    stop.snap.node.lat,
                    stop.snap.node.lon,
                    s.snap.node.lat,
                    s.snap.node.lon
                );
                return dist < minDistThreshold;
            });

            if (tooClose) {
                alert(`Too close to an already saved point.`);
                return prev;
            }

            const newBundle = {
                email: currentUser.email,
                stop: stop,
            };

            alert("Location saved successfully.");
            return [...prev, newBundle];
        });
    };

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
                travelMode={travelMode}
                setTravelMode={setTravelMode}
                selectedRoute={selectedRoute}
                setSelectedRoute={setSelectedRoute}
                stops={stops}
                setStops={setStops}
                pointInfo={pointInfo}
                setPointInfo={setPointInfo}
                handleStopSave={handleStopSave}
                handlePathVisit={handlePathVisit}
                isSearchFocus={isSearchFocus}
            />

            <div ref={searchWrapperRef} className={styles["search-container"]}>
                <SearchBar
                    searchKey={searchKey}
                    setKey={setSearchKey}
                    inputRef={searchInputRef}
                    onFocus={() => setSearchFocus(true)}
                    isActive={isSearchFocus}
                    onChange={() => {
                        if (searchMode !== "default") {
                            setSearchMode("default");
                        }
                    }}
                />

                {isSearchFocus && (
                    <SearchList
                        result={searchResult}
                        mode={searchMode}
                        searchKey={searchKey}
                        onItemClick={handleSearchResultClick}
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
