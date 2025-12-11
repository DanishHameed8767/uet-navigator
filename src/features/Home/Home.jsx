import styles from "./Home.module.css";
import { useEffect, useState, useRef } from "react";
import SearchBar from "../../components/SearchBar/SearchBar.jsx";
import SearchList from "../../components/SearchList/SearchList.jsx";
import FilterBar from "../../components/FilterBar/FilterBar.jsx";
import savedLocations from "../../../public/data/saved.json";
import SingleLinkedList from "../../data-structures/linked-list.js";

const Home = ({ currentUser, setCurrentUser, searchMode, setSearchMode }) => {
    const [isViewType, setViewType] = useState("Flat");
    const toggleView = () => {
        setViewType((prev) => {
            return prev === "Flat" ? "Satellite" : "Flat";
        });
    };

    const [searchKey, setSearchKey] = useState("");
    const [isSearchFocus, setSearchFocus] = useState(false);
    const [searchResult, setSearchResult] = useState(null);
    const searchInputRef = useRef(null);

    useEffect(() => {
        if (searchMode === "default") return;
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
        setSearchKey("");
        if (searchMode === "saved")
            setSearchResult(loadSaved(currentUser.email));
    }, [searchMode]);

    return (
        <div
            className={
                styles.home +
                " " +
                (isViewType === "Flat"
                    ? styles["sat-view"]
                    : styles["flat-view"])
            }
        >
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
            {isSearchFocus && <SearchList result={searchResult} />}
            <FilterBar />
            <button className={styles["btn-toggle-view"]} onClick={toggleView}>
                <p>{isViewType}</p>
            </button>
            <div className={styles["zoom-btns-wrapper"]}>
                <button className={styles["btn-zoom-in"]}>+</button>
                <button className={styles["btn-zoom-out"]}>–</button>
            </div>
            <button className={styles["btn-cur-location"]}>
                <i className="fa-solid fa-location-crosshairs"></i>
                Current
            </button>
        </div>
    );
};

function loadSaved(email) {
    let list = new SingleLinkedList();
    savedLocations.forEach((elem) => {
        if (elem.email === email) list.append(elem);
    });
    return list;
}

function loadRecents(username) {}

export default Home;
