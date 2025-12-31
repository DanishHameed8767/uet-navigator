import styles from "./Home.module.css";
import { useEffect, useState, useRef, useMemo } from "react";
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

const Home = ({ currentUser, searchMode, setSearchMode }) => {
    const searchInputRef = useRef(null);
    const { graphData, setGraphData } = useGraphDataState();
    const [walkMatrix, setWalkMatrix] = useState(loadWalkData());
    const [stops, setStops] = useState([]);
    const [searchKey, setSearchKey] = useState("");
    const [isSearchFocus, setSearchFocus] = useState(false);
    const [searchResult, setSearchResult] = useState(null);

    const hydrated = useMemo(() => hydrateGraph(graphData), [graphData]);

    const [allSavedNodes, setAllSavedNodes] = useLocalStorage("saved_nodes", []);
    // useEffect(() => {
    //     if (searchMode === "default") return;

    //     searchInputRef.current?.focus();
    //     setSearchKey("");

    //     if (searchMode === "saved") {
    //         setSearchResult(loadSaved(currentUser.email));
    //     }

    //     if (searchMode === "recents") {
    //         setSearchResult(loadRecents(currentUser.email));
    //     }
    // }, [searchMode, currentUser.email]);

    const handlePathVisit = () => {
        alert("Path added to recent visits");
    };

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
        email: currentUser?.email || ""
    };

    setAllSavedNodes((prev) => {
        const minDistanceThreshold = 10; // Minimum distance in meters to allow a new save

        // 4. RANGE CHECK: Ensure node is not too close to existing saved nodes for this user
        const tooClose = prev.some((node) => {
            if (node.email !== nodeToSave.email) return false;
            
            // Calculate distance between new point and existing saved point
            const dist = getDistance(nodeToSave.lat, nodeToSave.lon, node.lat, node.lon);
            return dist < minDistanceThreshold;
        });

        if (tooClose) {
            alert(`This location is too close to an already saved point (less than ${minDistanceThreshold}m).`);
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
