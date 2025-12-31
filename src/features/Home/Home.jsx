import styles from "./Home.module.css";
import { useState, useRef, useMemo, useEffect } from "react";
import SearchBar from "../../components/SearchBar/SearchBar.jsx";
import SearchList from "../../components/SearchList/SearchList.jsx";
import FilterBar from "../../components/FilterBar/FilterBar.jsx";
import PickPathDialog from "../../components/PickPathCard/PickPathCard.jsx";
import MapCanvas from "../MapCanvas/MapCanvas.jsx";

import savedLocations from "../../../public/data/saved.json";
import recentLocations from "../../../public/data/recents.json";

import SingleLinkedList from "../../data-structures/linked-list.js";
import { loadWalkData } from "../../utils/appHelper.js";
import useGraphDataState from "../../hooks/useGraphDataState.js";
import { hydrateGraph } from "../../data-structures/graph";
import useLocalStorage from "../../hooks/useLocalStorage.js";
import { getDistance, pixelToLatLon } from "../../utils/mapHelper.js";
import BottomPopup from "../../components/BottomPopup/BottomPopup.jsx";
import TravelModeSelector from "../../components/TravelModeSelector/TravelModeSelector.jsx";
import RoutesList from "../../components/RoutesList/RoutesList.jsx";
import PointInfoPopup from "../../components/PointInfoPopup/PointInfoPopup.jsx";

const Home = ({ currentUser, searchMode, setSearchMode }) => {
    const searchInputRef = useRef(null);
    const { graphData, setGraphData } = useGraphDataState();
    const [walkMatrix, setWalkMatrix] = useState(loadWalkData());
    const [stops, setStops] = useState([]);
    const [searchKey, setSearchKey] = useState("");
    const [isSearchFocus, setSearchFocus] = useState(false);
    const [searchResult, setSearchResult] = useState(null);
    const [selectedRoute, setSelectedRoute] = useState("r1");
    const [mode, setMode] = useState("car");
    const [open, setOpen] = useState(false);
    const [popup, setPopup] = useState(null);
    const handleMapClick = (e) => {
        setPopup({
            position: { x: e.clientX, y: e.clientY },
            ...dummyPoint,
        });
    };

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

    const dummyPoint = {
        name: "Ghoray Shah",
        near: "UET Main Gate",
        lat: 31.585387,
        lng: 74.351726,
        imageUrl: "https://via.placeholder.com/128x128.png?text=Place",
    };

    const hydrated = useMemo(() => hydrateGraph(graphData), [graphData]);

    const [allSavedNodes, setAllSavedNodes] = useLocalStorage(
        "saved_nodes",
        []
    );
    const [recentPaths, setRecentPaths] = useLocalStorage("recent_paths", []);
    useEffect(() => {
        if (searchMode === "default") return;

        searchInputRef.current?.focus();
        setSearchKey("");

        if (searchMode === "saved") {
            setSearchResult(loadSaved(currentUser?.email));
        }

        if (searchMode === "recents") {
            setSearchResult(loadRecents(currentUser?.email));
        }
    }, [searchMode, currentUser?.email]);

    // const handlePathVisit = () => {
    //     alert("Path added to recent visits");
    // };
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
        if (searchMode === "recents") {
            const list = new SingleLinkedList();

            // Filter for current user's paths
            const userRecents = recentPaths.filter(
                (path) => path.email === currentUser.email
            );

            userRecents.forEach((path) => {
                // We can represent a "Recent Path" as a single card
                // showing the start and end node names
                const startNode = path.nodes[0]?.name || "Start";
                const endNode =
                    path.nodes[path.nodes.length - 1]?.name || "End";

                list.append({
                    id: path.timestamp, // unique ID for the card
                    type: "recent-path",
                    name: `${startNode} → ${endNode}`,
                    near: `${path.nodes.length} stops visited`,
                    pathData: path.nodes, // Store the actual nodes here for re-loading
                });
            });

            setSearchResult(list);
        }
    }, [searchMode, recentPaths, currentUser?.email]);

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
                stops={stops}
                setStops={setStops}
                handleStopSave={handleStopSave}
            />

            <SearchBar
                searchKey={searchKey}
                setKey={setSearchKey}
                ref={searchInputRef}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
                onChange={() => {
                    setSearchMode("default");
                }}
            />
            {isSearchFocus && (
                <SearchList
                    result={searchResult}
                    mode={searchMode}
                    searchKey={searchKey}
                />
            )}
            <FilterBar />
            {stops.length > 0 && (
                <PickPathDialog
                    stops={stops}
                    setStops={setStops}
                    handlePathVisit={handlePathVisit}
                    handleStopSave={handleStopSave}
                />
            )}
            <>
                <button
                    onClick={(e) => {
                        setOpen(true);
                        handleMapClick(e);
                    }}
                    style={{
                        position: "absolute",
                        top: "95px",
                        backgroundColor: "red",
                        padding: "10px",
                        color: "white",
                        cursor: "pointer",
                        borderRadius: "5px",
                        border: "none",
                    }}
                >
                    Simulate Node Click
                </button>

                <BottomPopup open={true} title="Routes">
                    <TravelModeSelector value={mode} onChange={setMode} />

                    <RoutesList
                        routes={dummyRoutes}
                        selectedId={selectedRoute}
                        onSelect={(route) => setSelectedRoute(route.id)}
                    />
                </BottomPopup>
            </>
            <>
                <PointInfoPopup
                    open={!!popup}
                    {...popup}
                    onAddStop={() => console.log("Add stop")}
                    onClose={() => setPopup(null)}
                />
            </>
        </div>
    );
};

function loadSaved(email) {
    const list = new SingleLinkedList();
    savedLocations.forEach((elem) => {
        if (elem.email === email) list.append(elem);
    });
    return list;
}

function loadRecents(email) {
    const list = new SingleLinkedList();
    recentLocations.forEach((elem) => {
        if (elem.email === email) list.append(elem);
    });
    return list;
}

export default Home;
