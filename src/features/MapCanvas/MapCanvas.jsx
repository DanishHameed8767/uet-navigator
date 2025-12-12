import styles from "./MapCanvas.module.css";
import { useEffect, useState, useRef } from "react";
import React from "react";
import { Stage, Layer, Image as KonvaImage, Circle, Line } from "react-konva";
import useImage from "use-image";
import mapFlat from "../../../public/images/map/flat.png";
import mapSat from "../../../public/images/map/sat.png";
import { pixelToLatLon, latLonToPixel } from "../../utils/configMap.js";

const MapCanvas = () => {
    const containerRef = useRef(null);
    const stageRef = useRef(null);
    const zoomIntervalRef = useRef(null);

    const [imageMapFlat] = useImage(mapFlat);
    const [imageMapSat] = useImage(mapSat);
    const [scale, setScale] = useState(0.13);
    const [position, setPosition] = useState({ x: 270, y: 30 });
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [selectedId, setSelectedId] = useState(null);

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

    const getNodeById = (id) => nodes.find((n) => n.id === id);

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

    const handleStageClick = (e) => {
        if (e.target.getClassName() === "Circle" || e.evt.button !== 0) return;
        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        const imageX = (pointer.x - stage.x()) / stage.scaleX();
        const imageY = (pointer.y - stage.y()) / stage.scaleX();
        const { lat, lon } = pixelToLatLon(imageX, imageY);
        const newNode = {
            id: Math.round(imageX) + "," + Math.round(imageY),
            lat: lat,
            lon: lon,
        };
        setNodes((prev) => [...prev, newNode]);
        console.log("Saved Node:", lat, lon);
    };

    const handleNodeClick = (e, nodeId) => {
        e.cancelBubble = true;
        if (e.evt.button !== 0) return;
        if (selectedId === null) {
            setSelectedId(nodeId);
            console.log("Selected Node:", nodeId);
        } else if (selectedId === nodeId) {
            setSelectedId(null);
            console.log("Deselected");
        } else {
            const newEdge = { from: selectedId, to: nodeId };
            setEdges((prev) => [...prev, newEdge]);
            setSelectedId(nodeId);
            console.log(`Connected ${selectedId} to ${nodeId}`);
        }
    };

    const handleNodeContextMenu = (e, nodeId) => {
        e.evt.preventDefault();
        e.cancelBubble = true;
        setNodes((prev) => prev.filter((n) => n.id !== nodeId));
        setEdges((prev) =>
            prev.filter((edge) => edge.from !== nodeId && edge.to !== nodeId)
        );
        if (selectedId === nodeId) setSelectedId(null);
        console.log(`Deleted Node ${nodeId} and connections.`);
    };

    const handleEdgeContextMenu = (e, index) => {
        e.evt.preventDefault();
        e.cancelBubble = true;
        setEdges((prev) => prev.filter((_, i) => i !== index));
        console.log("Deleted Edge");
    };

    const dragBoundFunc = (pos) => {
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

    const [viewType, setViewType] = useState("Flat");
    const toggleView = () => {
        setViewType((prev) => {
            return prev === "Flat" ? "Satellite" : "Flat";
        });
    };

    return (
        <div className={styles["map-container"]}>
            <div className={styles["map-canvas"]} ref={containerRef}>
                <Stage
                    ref={stageRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    draggable
                    dragBoundFunc={dragBoundFunc}
                    onWheel={handleWheel}
                    onClick={handleStageClick}
                    scaleX={scale}
                    scaleY={scale}
                    x={position.x}
                    y={position.y}
                    onDragEnd={(e) => {
                        setPosition({ x: e.target.x(), y: e.target.y() });
                    }}
                >
                    <Layer>
                        <KonvaImage
                            image={
                                viewType === "Flat" ? imageMapFlat : imageMapSat
                            }
                        />
                        {edges.map((edge, i) => {
                            const nodeA = getNodeById(edge.from);
                            const nodeB = getNodeById(edge.to);
                            if (!nodeA || !nodeB) return null;
                            const posA = latLonToPixel(nodeA.lat, nodeA.lon);
                            const posB = latLonToPixel(nodeB.lat, nodeB.lon);
                            return (
                                <Line
                                    key={i}
                                    points={[posA.x, posA.y, posB.x, posB.y]}
                                    stroke="blue"
                                    strokeWidth={3 / scale}
                                    hitStrokeWidth={5 / scale}
                                    onContextMenu={(e) =>
                                        handleEdgeContextMenu(e, i)
                                    }
                                />
                            );
                        })}
                        {nodes.map((node) => {
                            const { x, y } = latLonToPixel(node.lat, node.lon);
                            const isSelected = selectedId === node.id;
                            return (
                                <Circle
                                    key={node.id}
                                    x={x}
                                    y={y}
                                    radius={isSelected ? 8 : 5}
                                    fill={isSelected ? "yellow" : "red"}
                                    stroke="black"
                                    strokeWidth={1}
                                    scaleX={1 / scale}
                                    scaleY={1 / scale}
                                    onClick={(e) => handleNodeClick(e, node.id)}
                                    onContextMenu={(e) =>
                                        handleNodeContextMenu(e, node.id)
                                    }
                                />
                            );
                        })}
                    </Layer>
                </Stage>
            </div>

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

export default MapCanvas;
