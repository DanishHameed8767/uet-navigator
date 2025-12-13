import styles from "./MapCanvas.module.css";
import { useEffect, useState, useRef } from "react";
import { parseSafely } from "../../utils/appHelper.js";
import useImage from "use-image";
import mapFlat from "../../assets/map/flat.png";
import mapSat from "../../assets/map/sat.png";
import storedNodes from "../../../public/data/nodes.json";
import storedEdges from "../../../public/data/edges.json";
import MapView from "../MapView/MapView.jsx";
import MapBuilder from "../MapBuilder/MapBuilder.jsx";

const MapCanvas = ({ currentUser }) => {
    const containerRef = useRef(null);
    const stageRef = useRef(null);
    const zoomIntervalRef = useRef(null);
    const [nodes, setNodes] = useState(loadNodesData());
    const [edges, setEdges] = useState(loadEdgesData());
    const [viewType, setViewType] = useState("Flat");
    const [imageMapFlat] = useImage(mapFlat);
    const [imageMapSat] = useImage(mapSat);
    const [scale, setScale] = useState(0.13);
    const [position, setPosition] = useState({ x: 270, y: 30 });
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                });
            }
        };
        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    useEffect(() => {
        localStorage.setItem("map-nodes", JSON.stringify(nodes));
    }, [nodes]);

    useEffect(() => {
        localStorage.setItem("map-edges", JSON.stringify(edges));
    }, [edges]);

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

    const handleZoomBtns = (factor) => {
        const stage = stageRef.current;
        if (!stage) return;
        const scaleBy = 1.1;
        const oldScale = stage.scaleX();
        let newScale =
            factor === "in" ? oldScale * scaleBy : oldScale / scaleBy;
        if (newScale < 0.13) newScale = 0.13;
        else if (newScale > 1.23) newScale = 1.23;
        const pointer = {
            x: stage.width() / 2,
            y: stage.height() / 2,
        };
        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };
        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };
        setScale(newScale);
        setPosition(newPos);
    };

    const handleWheel = (e) => {
        e.evt.preventDefault();
        const stage = e.target.getStage();
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();
        const scaleBy = 1.1;
        let newScale =
            e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
        if (newScale < 0.13) newScale = 0.13;
        else if (newScale > 1.23) newScale = 1.23;
        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };
        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };
        setScale(newScale);
        setPosition(newPos);
    };

    const boundDrag = (pos) => {
        const image = viewType === "Flat" ? imageMapFlat : imageMapSat;
        const mapWidth = image.width * scale;
        const mapHeight = image.height * scale;
        const minX = dimensions.width - mapWidth;
        const minY = dimensions.height - mapHeight;
        let { x, y } = pos;
        if (mapWidth > dimensions.width) {
            if (x > 0) x = 0;
            if (x < minX) x = minX;
        } else {
            if (x < 0) x = 0;
            if (x > dimensions.width - mapWidth)
                x = dimensions.width - mapWidth;
        }
        if (mapHeight > dimensions.height) {
            if (y > 0) y = 0;
            if (y < minY) y = minY;
        } else {
            if (y < 0) y = 0;
            if (y > dimensions.height - mapHeight)
                y = dimensions.height - mapHeight;
        }
        return { x, y };
    };

    const toggleView = () => {
        setViewType((prev) => {
            return prev === "Flat" ? "Satellite" : "Flat";
        });
    };

    return (
        <div className={styles["map-canvas"]}>
            {currentUser?.email === "admin@navigator.uet" ? (
                <MapBuilder
                    dimensions={dimensions}
                    scale={scale}
                    position={position}
                    setPosition={setPosition}
                    nodes={nodes}
                    edges={edges}
                    setNodes={setNodes}
                    setEdges={setEdges}
                    viewType={viewType}
                    imageMapFlat={imageMapFlat}
                    imageMapSat={imageMapSat}
                    containerRef={containerRef}
                    stageRef={stageRef}
                    boundDrag={boundDrag}
                    handleWheel={handleWheel}
                />
            ) : (
                <MapView
                    dimensions={dimensions}
                    scale={scale}
                    position={position}
                    setPosition={setPosition}
                    nodes={nodes}
                    edges={edges}
                    viewType={viewType}
                    imageMapFlat={imageMapFlat}
                    imageMapSat={imageMapSat}
                    containerRef={containerRef}
                    stageRef={stageRef}
                    boundDrag={boundDrag}
                    handleWheel={handleWheel}
                />
            )}
            <button className={styles["btn-toggle-view"]} onClick={toggleView}>
                <p>{viewType}</p>
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
                    setScale(0.13);
                    setPosition({ x: 270, y: 30 });
                }}
            >
                <i className="fa-solid fa-location-crosshairs"></i>
                Current
            </button>
        </div>
    );
};

const loadNodesData = () => {
    let savedNodes = localStorage.getItem("map-nodes");
    if (savedNodes) {
        savedNodes = parseSafely(savedNodes);
    } else {
        localStorage.setItem("map-nodes", JSON.stringify(storedNodes));
        savedNodes = storedNodes;
    }
    return savedNodes;
};

const loadEdgesData = () => {
    let savedEdges = localStorage.getItem("map-edges");
    if (savedEdges) {
        savedEdges = parseSafely(savedEdges);
    } else {
        localStorage.setItem("map-edges", JSON.stringify(storedEdges));
        savedEdges = storedEdges;
    }
    return savedEdges;
};

export default MapCanvas;
