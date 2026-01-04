import styles from "./MapCanvas.module.css";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import useImage from "use-image";
import mapFlat from "../../assets/map/flat.png";
import mapSat from "../../assets/map/sat.jpg";
import MapView from "../MapView/MapView.jsx";
import MapBuilder from "../MapBuilder/MapBuilder.jsx";
import MapControls from "../../components/MapControls/MapControls.jsx";
import MapHUD from "../MapHUD/MapHUD.jsx";
import { resolveNameType, resolveNear } from "../../utils/mapHelper.js";
import { loadWalkData } from "../../utils/appHelper.js";
import { getRoute } from "../../utils/routeManager.js";

const MapCanvas = ({
    graphData,
    setGraphData,
    graph,
    renderNodes,
    renderEdges,
    indexes,
    currentUser,
    stops,
    setStops,
    handleStopSave,
    handlePathVisit,
}) => {
    const containerRef = useRef(null);
    const stageRef = useRef(null);
    const [viewType, setViewType] = useState("Flat");
    const [imageMapFlat] = useImage(mapFlat);
    const [imageMapSat] = useImage(mapSat);
    const [scale, setScale] = useState(0.208);
    const [detailLevel, setDetailLevel] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const [selectedRoute, setSelectedRoute] = useState("shortest");
    const [pointInfo, setPointInfo] = useState(null);
    const [travelMode, setTravelMode] = useState("car");
    const [walkMatrix, setWalkMatrix] = useState(loadWalkData());

    const zoomLimits = useMemo(() => {
        const image = viewType === "Flat" ? imageMapFlat : imageMapSat;
        if (!image || dimensions.width === 0) {
            return { min: 0.1, max: 1.3 };
        }
        const minScaleW = dimensions.width / image.width;
        const minScaleH = dimensions.height / image.height;
        const minScale = Math.max(minScaleW, minScaleH);
        return {
            min: minScale,
            max: 1.3,
        };
    }, [dimensions, imageMapFlat, imageMapSat, viewType]);

    const gridConfig = useMemo(() => {
        if (!walkMatrix || walkMatrix.length === 0) {
            return null;
        }
        const currentImage = imageMapFlat;
        if (!currentImage) {
            return null;
        }
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
            if (!image) {
                return newPos;
            }
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

    const clampedScale = Math.max(
        zoomLimits.min,
        Math.min(scale, zoomLimits.max)
    );

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
        const stepSize = (zoomLimits.max - zoomLimits.min) / 4; // 5 (1-5) levels of details
        const newLevel = Math.floor(scale / stepSize) + 1;
        setDetailLevel((prev) => (prev !== newLevel ? newLevel : prev));
    }, [scale]);

    useEffect(() => {
        localStorage.setItem("map-walk-matrix", JSON.stringify(walkMatrix));
    }, [walkMatrix]);

    const handleZoomBtns = (factor) => {
        const stage = stageRef.current;
        if (!stage) {
            return;
        }
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

    const openPointInfo = (stop) => {
        setPointInfo(
            resolvePoint(stop, renderNodes, graph.adjacency, graphData.nodes)
        );
    };

    const isWalkMode = travelMode === "walk";

    const nodeLookup = useMemo(() => {
        if (!renderNodes) {
            return {};
        }
        const lookup = {};
        renderNodes.forEach((node) => {
            lookup[node.id] = node;
        });
        return lookup;
    }, [renderNodes]);

    const routeResult = useMemo(() => {
        if (
            !stops ||
            stops.length < 2 ||
            (isWalkMode && (!walkMatrix || !gridConfig)) ||
            (!isWalkMode && (!graph || !nodeLookup))
        ) {
            return null;
        }
        const useStreets = travelMode !== "car";
        return getRoute({
            stops,
            travelMode,
            graph,
            walkMatrix,
            gridConfig,
            nodeLookup,
            useStreets,
        });
    }, [
        stops,
        travelMode,
        isWalkMode,
        graph,
        walkMatrix,
        gridConfig,
        nodeLookup,
    ]);

    return (
        <div className={styles["map-canvas"]}>
            {currentUser?.email === "admin@navigator.uet" ? (
                <MapBuilder
                    graphData={graphData}
                    setGraphData={setGraphData}
                    graph={graph}
                    renderNodes={renderNodes}
                    renderEdges={renderEdges}
                    indexes={indexes}
                    dimensions={dimensions}
                    scale={clampedScale}
                    detailLevel={detailLevel}
                    position={position}
                    setPosition={setPosition}
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
                <>
                    <MapView
                        graph={graph}
                        graphData={graphData}
                        renderNodes={renderNodes}
                        renderEdges={renderEdges}
                        dimensions={dimensions}
                        scale={clampedScale}
                        detailLevel={detailLevel}
                        position={position}
                        setPosition={setPosition}
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
                        pointInfo={pointInfo}
                        openPointInfo={openPointInfo}
                        routeResult={routeResult}
                        selectedRoute={selectedRoute}
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
                        nodes={renderNodes}
                        adjacency={graph.adjacency}
                        nodeLookup={graphData.nodes}
                        routeResult={routeResult}
                        selectedRoute={selectedRoute}
                        setSelectedRoute={setSelectedRoute}
                    />
                </>
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

export default MapCanvas;
