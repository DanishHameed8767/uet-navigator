import { useRef } from "react";
import styles from "./MapControls.module.css";

const MapControls = ({
    travelMode,
    setTravelMode,
    viewType,
    setViewType,
    handleZoomBtns,
}) => {
    const zoomIntervalRef = useRef(null);

    const startZoom = (direction) => {
        handleZoomBtns(direction);
        zoomIntervalRef.current = setInterval(() => {
            handleZoomBtns(direction);
        }, 100);
    };

    const stopZoom = () => {
        if (zoomIntervalRef.current) {
            clearInterval(zoomIntervalRef.current);
            zoomIntervalRef.current = null;
        }
    };

    const toggleView = () => {
        setViewType((prev) => {
            return prev === "Flat" ? "Satellite" : "Flat";
        });
    };

    return (
        <>
            <select
                value={travelMode}
                className={styles["select-travel-mode"]}
                onChange={(e) => setTravelMode(e.target.value)}
                required
            >
                <option value="car">Car</option>
                <option value="bike">Bike</option>
                <option value="walk">Walk</option>
            </select>
            <button
                className={
                    styles["btn-toggle-view"] +
                    " " +
                    (viewType === "Flat"
                        ? styles["btn-toggle-view-sat"]
                        : styles["btn-toggle-view-flat"])
                }
                onClick={toggleView}
            >
                <p>{viewType === "Flat" ? "Satellite" : "Flat"}</p>
            </button>
            <div className={styles["zoom-btns-wrapper"]}>
                <button
                    className={styles["btn-zoom-in"]}
                    onMouseDown={() => startZoom("in")}
                    onMouseUp={stopZoom}
                    onMouseLeave={stopZoom}
                >
                    +
                </button>
                <button
                    className={styles["btn-zoom-out"]}
                    onMouseDown={() => startZoom("out")}
                    onMouseUp={stopZoom}
                    onMouseLeave={stopZoom}
                >
                    –
                </button>
            </div>
            <button
                className={styles["btn-cur-location"]}
                onClick={() => {
                    setScale(0.208);
                    setPosition({ x: 0, y: 0 });
                }}
            >
                <i className="fa-solid fa-location-crosshairs"></i>
                Current
            </button>
        </>
    );
};

export default MapControls;
