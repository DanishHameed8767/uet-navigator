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

const Home = ({ currentUser, searchMode, setSearchMode }) => {
    const searchInputRef = useRef(null);
    const { graphData, setGraphData } = useGraphDataState();
    const [walkMatrix, setWalkMatrix] = useState(loadWalkData());
    const [stops, setStops] = useState([]);
    const [searchKey, setSearchKey] = useState("");
    const [isSearchFocus, setSearchFocus] = useState(false);
    const [searchResult, setSearchResult] = useState(null);

    const hydrated = useMemo(() => hydrateGraph(graphData), [graphData]);

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
        alert("Stop " + stop.point.x + " - " + stop.point.y + " saved");
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
