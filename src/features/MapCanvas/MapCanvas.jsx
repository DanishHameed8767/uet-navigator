import styles from "./MapCanvas.module.css";
import { useEffect, useState, useRef } from "react";
import React from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import mapFile from "../../../public/images/map/flat.png";

const MapCanvas = () => {
    const [image] = useImage(mapFile);
    const [viewType, setViewType] = useState("Flat");
    const toggleView = () => {
        setViewType((prev) => {
            return prev === "Flat" ? "Satellite" : "Flat";
        });
    };
    return (
        <div className={styles["map-canvas"]}>
            {/* + " " + (viewType === "Flat" ? styles["flat-view"] : styles["sat-view"]) */}
            <Stage width={window.innerWidth} height={window.innerHeight}>
                <Layer draggable>
                    <KonvaImage image={image} />
                </Layer>
            </Stage>
            {/* Control Layer */}
            <button className={styles["btn-toggle-view"]} onClick={toggleView}>
                <p>{viewType}</p>
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

export default MapCanvas;
