import styles from "./Home.module.css";
import React, { useState } from "react";
import SearchBar from "../../components/SearchBar/SearchBar.jsx";
import FilterBar from "../../components/FilterBar/FilterBar.jsx";
import MapCanvas from "../../components/MapCanvas.jsx";

const Home = () => {
    const [isViewType, setViewType] = useState("Flat");
    const toggleView = () => {
        setViewType((prev) => {
            return prev === "Flat" ? "Satellite" : "Flat";
        });
    };
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
            <SearchBar />
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

export default Home;
