import styles from "./Home.module.css";
import { useState, useRef, useMemo, useEffect } from "react";
import SearchBar from "../../components/SearchBar/SearchBar.jsx";
import SearchList from "../../components/SearchList/SearchList.jsx";
import FilterBar from "../../components/FilterBar/FilterBar.jsx";
import MapCanvas from "../MapCanvas/MapCanvas.jsx";

import SingleLinkedList from "../../data-structures/linked-list.js";
import { loadWalkData } from "../../utils/appHelper.js";
import useGraphDataState from "../../hooks/useGraphDataState.js";
import { hydrateGraph } from "../../data-structures/graph";
import useLocalStorage from "../../hooks/useLocalStorage.js";
import {
    getDistance,
    pixelToLatLon,
    resolveNameType,
    resolveNear,
} from "../../utils/mapHelper.js";
import BottomPopup from "../../components/BottomPopup/BottomPopup.jsx";
import TravelModeSelector from "../../components/TravelModeSelector/TravelModeSelector.jsx";
import RoutesList from "../../components/RoutesList/RoutesList.jsx";
import { useSearchData } from "../../context/SearchContext.jsx";
import MapHUD from "../MapHUD/MapHUD.jsx";

const Home = ({ currentUser, searchMode, setSearchMode }) => {
    const searchInputRef = useRef(null);
    const searchWrapperRef = useRef(null);

    const { graphData, setGraphData } = useGraphDataState();
    const [walkMatrix, setWalkMatrix] = useState(loadWalkData());
    const [stops, setStops] = useState([]);
    const [searchKey, setSearchKey] = useState("");
    const [isSearchFocus, setSearchFocus] = useState(false);
    const [searchResult, setSearchResult] = useState(null);
    const [selectedRoute, setSelectedRoute] = useState("r1");
    const [mode, setMode] = useState("car");
    const [open, setOpen] = useState(false);
    const [pointInfo, setPointInfo] = useState(null);
    const [visibleSavedLimit, setVisibleSavedLimit] = useState(5);
    const { searchableNodes } = useSearchData();

    const [travelMode, setTravelMode] = useState("car");

    const dummyRoutes = [
        {
            id: "route-1",
            title: "via Bilal Park Rd",
            subtitle: "Fastest route",
            time: 2,
            distance: 550,
        },
        {
            id: "route-2",
            title: "via Street 46 & Bilal Park Rd",
            subtitle: "Less traffic",
            time: 3,
            distance: 600,
        },
        {
            id: "route-3",
            title: "via Shopping Center Rd",
            subtitle: "Scenic route",
            time: 4,
            distance: 720,
        },
        {
            id: "route-4",
            title: "via GT Rd",
            subtitle: "Scenic route",
            time: 4,
            distance: 720,
        },
    ];

    const hydrated = useMemo(() => hydrateGraph(graphData), [graphData]);

    const [allSavedNodes, setAllSavedNodes] = useLocalStorage(
        "saved_nodes",
        []
    );

    const [recentPaths, setRecentPaths] = useLocalStorage("recent_paths", []);

    useEffect(() => {
        // REMOVE THIS LINE: setSearchKey("");
        setVisibleSavedLimit(5);

        if (searchMode !== "default") {
            searchInputRef.current?.focus();
        }
    }, [searchMode]);

    // 2. Add the Click Outside Listener
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
                setVisibleSavedLimit(5);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            // Optional: Hard reset on unmount is already handled here
        };
    }, [setSearchMode]); // setSearchMode is a stable prop, but good to include

    const handlePathVisit = () => {
        if (stops.length === 0) return;

        // 1. Prepare the path nodes array
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
    useEffect(() => {
        if (searchMode === "default") {
            setSearchResult(null);
            return;
        }

        if (searchMode === "saved") {
            // Removed searchKey parameter
            setSearchResult(
                loadSaved(currentUser?.email, allSavedNodes, visibleSavedLimit)
            );
        }

        if (searchMode === "recents") {
            // Removed searchKey parameter
            setSearchResult(
                loadRecents(currentUser?.email, recentPaths, visibleSavedLimit)
            );
        }
    }, [
        searchMode,
        currentUser?.email,
        allSavedNodes,
        recentPaths,
        visibleSavedLimit,
    ]);
    const handleStopSave = (stop) => {
        if (!stop || !stop.point) return;

        // 1. Convert clicked pixel x,y to Lat/Lon
        const { lat, lon } = pixelToLatLon(stop.point.x, stop.point.y);

        // 2. SEARCH: Find if these coordinates exist in your graph data
        const graphNodesArray = Object.values(hydrated.graph.nodes);
        const matchedNode = graphNodesArray.find(
            (node) => node.lat === lat && node.lon === lon
        );

        // 3. BUILD: If found, use graph data; else save only lat/lon
        const nodeToSave = {
            id: matchedNode?.id || "",
            lat: lat,
            lon: lon,
            name: matchedNode?.name || "",
            type: matchedNode?.type || "",
            tier: matchedNode?.tier || null,
            email: currentUser?.email || "",
        };

        setAllSavedNodes((prev) => {
            const minDistanceThreshold = 10; // Minimum distance in meters to allow a new save

            // 4. RANGE CHECK: Ensure node is not too close to existing saved nodes for this user
            const tooClose = prev.some((node) => {
                if (node.email !== nodeToSave.email) return false;

                // Calculate distance between new point and existing saved point
                const dist = getDistance(
                    nodeToSave.lat,
                    nodeToSave.lon,
                    node.lat,
                    node.lon
                );
                return dist < minDistanceThreshold;
            });

            if (tooClose) {
                alert(
                    `This location is too close to an already saved point (less than ${minDistanceThreshold}m).`
                );
                return prev;
            }

            const message = matchedNode
                ? `Saved Graph Node: ${matchedNode.name || matchedNode.id}`
                : `Saved Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;

            alert(message);
            return [...prev, nodeToSave];
        });
    };

    useEffect(() => {
        // Only search if focus is active and we have at least 1 character
        if (!isSearchFocus || searchKey.length === 0) {
            if (searchMode === "default") setSearchResult(null);
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
                    near: node.type, // e.g., "Library", "Intersection", "Gate"
                });
            });

            setSearchResult(list);
        }
    }, [searchKey, isSearchFocus, searchMode, searchableNodes]);

    /**
     * Processes and filters saved locations for the search list.
     */
    function loadSaved(email, allSavedNodes, limit) {
        const list = new SingleLinkedList();

        // Filter ONLY by user email, ignore the search key
        const userNodes = allSavedNodes.filter((node) => node.email === email);

        // Paginate and append to list
        const paginatedNodes = userNodes.slice(0, limit);
        paginatedNodes.forEach((node) => {
            list.append({
                ...node,
                name: node.name || "Unnamed",
                near: node.type,
            });
        });

        list.hasMore = userNodes.length > limit;
        return list;
    }

    /**
     * Processes and filters travel history for the connected-line view.
     */
    function loadRecents(email, recentPaths, limit) {
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
    }

    const openPointInfo = (stop) => {
        setPointInfo(
            resolvePoint(
                stop,
                hydrated.render.nodes,
                hydrated.graph.adjacency,
                graphData.nodes
            )
        );
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
                walkMatrix={walkMatrix}
                setWalkMatrix={setWalkMatrix}
                travelMode={travelMode}
                setTravelMode={setTravelMode}
                stops={stops}
                setStops={setStops}
                handleStopSave={handleStopSave}
                openPointInfo={openPointInfo}
            />

            <MapHUD
                stops={stops}
                setStops={setStops}
                travelMode={travelMode}
                setTravelMode={setTravelMode}
                pointInfo={pointInfo}
                setPointInfo={setPointInfo}
                handlePathVisit={handlePathVisit}
                handleStopSave={handleStopSave}
                nodes={hydrated.render.nodes}
                adjacency={hydrated.graph.adjacency}
                nodeLookup={graphData.nodes}
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
                        searchKey={searchKey}
                        onSeeMore={() =>
                            setVisibleSavedLimit((prev) => prev + 5)
                        }
                    />
                )}
            </div>
            <FilterBar />
        </div>
    );
};

const resolvePoint = (stop, nodes, adjacency, nodeLookup) => {
    let { name } = resolveNameType(stop, adjacency, nodeLookup);
    name = name || "unnamed point";
    let near = resolveNear(stop, name, nodes) || "not found";
    near = near.length > 40 ? near.slice(0, 40) + "..." : near;
    return stop?.snap
        ? {
              stop: stop,
              info: {
                  name,
                  near,
                  lat: stop.snap.node.lat,
                  lon: stop.snap.node.lon,
                  imageUrl:
                      "https://via.placeholder.com/128x128.png?text=Place",
              },
          }
        : null;
};

export default Home;

/* 
    //    useEffect(() => {
    //     if (searchMode === "default") return;

    //     searchInputRef.current?.focus();
    //     setSearchKey("");

    //     if (searchMode === "saved") {
    //         setSearchResult(loadSaved(currentUser?.email, allSavedNodes, visibleSavedLimit));
    //     }

    //     if (searchMode === "recents") {
    //         // Pass the live state and the limit
    //         setSearchResult(loadRecents(currentUser?.email, recentPaths, visibleSavedLimit));
    //     }
    // }, [searchMode, currentUser?.email, allSavedNodes, visibleSavedLimit, recentPaths]);
    // Locate this block around line 113
    // Locate this block around line 113

        // useEffect(() => {
    //     if (searchMode === "default") return;

    //     searchInputRef.current?.focus();
    //     setSearchKey("");

    //     if (searchMode === "saved") {
    //         setSearchResult(loadSaved(currentUser?.email));
    //     }

    //     if (searchMode === "recents") {
    //         setSearchResult(loadRecents(currentUser?.email));
    //     }
    // }, [searchMode, currentUser?.email]);

    // const handlePathVisit = () => {
    //     alert("Path added to recent visits");
    // };
*/
