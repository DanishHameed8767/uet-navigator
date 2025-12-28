import styles from "./MapCanvas.module.css";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import useImage from "use-image";
import mapFlat from "../../assets/map/flat.png";
import mapSat from "../../assets/map/sat.jpg";
import MapView from "../MapView/MapView.jsx";
import MapBuilder from "../MapBuilder/MapBuilder.jsx";
import MapControls from "../../components/MapControls/MapControls.jsx";

const MapCanvas = ({
    currentUser,
    nodes,
    setNodes,
    edges,
    setEdges,
    walkMatrix,
    setWalkMatrix,
    stops,
    setStops,
    handleStopSave,
}) => {
    const containerRef = useRef(null);
    const stageRef = useRef(null);
    const [travelMode, setTravelMode] = useState("walk");
    const [viewType, setViewType] = useState("Flat");
    const [imageMapFlat] = useImage(mapFlat);
    const [imageMapSat] = useImage(mapSat);
    const [scale, setScale] = useState(0.208);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const zoomLimits = useMemo(() => {
        const image = viewType === "Flat" ? imageMapFlat : imageMapSat;
        if (!image || dimensions.width === 0) return { min: 0.1, max: 2 };
        const minScaleW = dimensions.width / image.width;
        const minScaleH = dimensions.height / image.height;
        const minScale = Math.max(minScaleW, minScaleH);
        return {
            min: minScale,
            max: 1.5,
        };
    }, [dimensions, imageMapFlat, imageMapSat, viewType]);

    const gridConfig = useMemo(() => {
        if (!walkMatrix || walkMatrix.length === 0) return null;
        const currentImage = imageMapFlat;
        if (!currentImage) return null;
        const rows = walkMatrix.length;
        const cols = walkMatrix[0].length;
        return {
            cellWidth: Math.ceil(currentImage.width / cols),
            cellHeight: Math.ceil(currentImage.height / rows),
            rows,
            cols,
        };
    }, [walkMatrix, imageMapFlat]);

    const getConstrainedPos = useCallback(
        (newPos, newScale) => {
            const image = viewType === "Flat" ? imageMapFlat : imageMapSat;
            if (!image) return newPos;
            const stageW = dimensions.width;
            const stageH = dimensions.height;
            const mapW = image.width * newScale;
            const mapH = image.height * newScale;
            let { x, y } = newPos;
            if (mapW > stageW) {
                const minX = stageW - mapW;
                const maxX = 0;
                x = Math.max(minX, Math.min(x, maxX));
            } else {
                x = (stageW - mapW) / 2;
            }
            if (mapH > stageH) {
                const minY = stageH - mapH;
                const maxY = 0;
                y = Math.max(minY, Math.min(y, maxY));
            } else {
                y = (stageH - mapH) / 2;
            }
            return { x, y };
        },
        [dimensions, imageMapFlat, imageMapSat, viewType]
    );

    useEffect(() => {
        if (scale < zoomLimits.min) setScale(zoomLimits.min);
    }, [zoomLimits.min, scale]);

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
        nodes.sort((a, b) => a.id - b.id);
        localStorage.setItem("map-nodes", JSON.stringify(nodes));
    }, [nodes]);

    useEffect(() => {
        localStorage.setItem("map-edges", JSON.stringify(edges));
    }, [edges]);

    useEffect(() => {
        localStorage.setItem("map-walk-matrix", JSON.stringify(walkMatrix));
    }, [walkMatrix]);

    const handleZoomBtns = (factor) => {
        const stage = stageRef.current;
        if (!stage) return;
        const scaleBy = 1.1;
        const oldScale = stage.scaleX();
        let newScale =
            factor === "in" ? oldScale * scaleBy : oldScale / scaleBy;
        newScale = Math.max(zoomLimits.min, Math.min(newScale, zoomLimits.max));
        const pointer = {
            x: stage.width() / 2,
            y: stage.height() / 2,
        };
        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };
        const rawPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };
        const newPos = getConstrainedPos(rawPos, newScale);
        setScale(newScale);
        setPosition(newPos);
    };

    const handleWheel = (e) => {
        e.evt.preventDefault();
        const stage = e.target.getStage();
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();
        const scaleBy = 1.05;
        let newScale =
            e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
        newScale = Math.max(zoomLimits.min, Math.min(newScale, zoomLimits.max));
        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };
        const rawPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };
        const newPos = getConstrainedPos(rawPos, newScale);
        setScale(newScale);
        setPosition(newPos);
    };

    const boundDrag = (pos) => {
        return getConstrainedPos(pos, scale);
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
                    travelMode={travelMode}
                    imageMapFlat={imageMapFlat}
                    imageMapSat={imageMapSat}
                    walkMatrix={walkMatrix}
                    setWalkMatrix={setWalkMatrix}
                    gridConfig={gridConfig}
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
                    travelMode={travelMode}
                    stops={stops}
                    setStops={setStops}
                    imageMapFlat={imageMapFlat}
                    imageMapSat={imageMapSat}
                    walkMatrix={walkMatrix}
                    gridConfig={gridConfig}
                    containerRef={containerRef}
                    stageRef={stageRef}
                    boundDrag={boundDrag}
                    handleWheel={handleWheel}
                    handleStopSave={handleStopSave}
                />
            )}

            <MapControls
                travelMode={travelMode}
                setTravelMode={setTravelMode}
                viewType={viewType}
                setViewType={setViewType}
                handleZoomBtns={handleZoomBtns}
            ></MapControls>
        </div>
    );
};

export default MapCanvas;
