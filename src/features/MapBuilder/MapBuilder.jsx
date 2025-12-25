import styles from "./MapBuilder.module.css";
import { useEffect, useState, useRef, useMemo } from "react";
import {
    Stage,
    Layer,
    Arrow,
    Image as KonvaImage,
    Circle,
    Line,
} from "react-konva";
import {
    pixelToLatLon,
    latLonToPixel,
    getDistance,
    getNodeTier,
} from "../../utils/mapHelper.js";
import NodeLabel from "../../components/NodeLabel/NodeLabel.jsx";
import EdgeLabel from "../../components/EdgeLabel/EdgeLabel.jsx";

const MapBuilder = ({
    nodes,
    edges,
    setNodes,
    setEdges,
    dimensions,
    scale,
    position,
    setPosition,
    viewType,
    travelMode,
    imageMapFlat,
    imageMapSat,
    walkMatrix,
    setWalkMatrix,
    gridConfig,
    containerRef,
    stageRef,
    boundDrag,
    handleWheel,
}) => {
    const [gridImage, setGridImage] = useState(null);

    const nodeInputRef = useRef(null);
    const edgeInputRef = useRef(null);
    const hitImgRef = useRef(null);
    const [selectedId, setSelectedId] = useState(null);

    const [tempNodes, setTempNodes] = useState([]);
    const [tempEdges, setTempEdges] = useState([]);

    const [tempNodeId, setTempNodeId] = useState(nodes.at(-1)?.id + 1);
    const [tempNodeName, setTempNodeName] = useState("");
    const [tempNodeTier, setTempNodeTier] = useState("");
    const [tempNodeType, setTempNodeType] = useState("");
    const [tempNodeLat, setTempNodeLat] = useState("");
    const [tempNodeLon, setTempNodeLon] = useState("");

    const [tempEdgeName, setTempEdgeName] = useState("");
    const [tempEdgeFrom, setTempEdgeFrom] = useState("");
    const [tempEdgeTo, setTempEdgeTo] = useState("");
    const [tempEdgeDist, setTempEdgeDist] = useState("");
    const [tempEdgeType, setTempEdgeType] = useState("");

    const edgeLookup = useMemo(() => {
        const lookup = new Set();
        edges.forEach((edge) => {
            lookup.add(`${edge.from}-${edge.to}`);
        });
        return lookup;
    }, [edges]);

    useEffect(() => {
        if (!gridConfig || !walkMatrix || travelMode !== "walk") return;
        const canvas = document.createElement("canvas");
        const currentImage = imageMapFlat;
        canvas.width = currentImage.width;
        canvas.height = currentImage.height;
        const ctx = canvas.getContext("2d");
        const cw = gridConfig.cellWidth;
        const ch = gridConfig.cellHeight;
        for (let r = 0; r < gridConfig.rows; r++) {
            for (let c = 0; c < gridConfig.cols; c++) {
                if (walkMatrix[r][c] === 0) {
                    ctx.fillStyle = "rgba(0, 0, 0, 1)";
                    ctx.fillRect(c * cw, r * ch, cw, ch);
                } else {
                    ctx.fillStyle = "rgba(255, 255, 255, 1)";
                    ctx.fillRect(c * cw, r * ch, cw, ch);
                }
            }
        }
        setGridImage(canvas);
    }, [gridConfig, walkMatrix, imageMapFlat]);

    useEffect(() => {
        const image = viewType === "Flat" ? imageMapFlat : imageMapSat;
        if (image) {
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);
            hitImgRef.current = ctx;
        }
    }, [imageMapFlat, imageMapSat]);

    const getNodeById = (id) => {
        return nodes.find((n) => n.id === id);
    };

    const handleStageClick = (e) => {
        if (e.target.getClassName() === "Circle" || e.evt.button !== 0) return;
        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        const imageX = (pointer.x - stage.x()) / stage.scaleX();
        const imageY = (pointer.y - stage.y()) / stage.scaleX();
        const image = viewType === "Flat" ? imageMapFlat : imageMapSat;
        if (
            imageX < 0 ||
            imageY < 0 ||
            imageX > image.width ||
            imageY > image.height
        ) {
            return;
        }
        if (hitImgRef.current) {
            const pixel = hitImgRef.current.getImageData(
                Math.floor(imageX),
                Math.floor(imageY),
                1,
                1
            ).data;
            if (pixel[3] < 10) return;
        }
        const { lat, lon } = pixelToLatLon(imageX, imageY);
        const newNode = { lat: lat, lon: lon };
        setTempEdges([]);
        setTempNodes([newNode]);
        setSelectedId(null);
        resetTempNode(nodes.at(-1)?.id + 1);
        setTempNodeLat(lat);
        setTempNodeLon(lon);
        if (nodeInputRef) nodeInputRef.current.focus();
    };

    const handleStageClickWalk = (e) => {
        e.cancelBubble = true;
        e.evt.preventDefault();
        if (!gridConfig || e.evt.button !== 0) return;
        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        const imgX = (pointer.x - stage.x()) / stage.scaleX();
        const imgY = (pointer.y - stage.y()) / stage.scaleY();
        const col = Math.floor(imgX / gridConfig.cellWidth);
        const row = Math.floor(imgY / gridConfig.cellHeight);
        if (
            row < 0 ||
            row >= gridConfig.rows ||
            col < 0 ||
            col >= gridConfig.cols
        )
            return;
        setWalkMatrix((prev) => {
            const newMat = [...prev];
            const newRow = [...newMat[row]];
            newRow[col] = (newRow[col] + 1) % 2;
            newMat[row] = newRow;
            return newMat;
        });
    };

    const handleNodeClick = (e, nodeId) => {
        e.cancelBubble = true;
        if (e.evt.button !== 0) return;
        if (selectedId === null) {
            setSelectedId(nodeId);
            setTempNode(nodeId);
            setTempEdgeFrom(nodeId);
        } else if (selectedId === nodeId) {
            setSelectedId(null);
            setTempNode(nodes.at(-1)?.id + 1);
            resetTempEdge();
            setTempEdges([]);
        } else {
            // Duplicate Check
            const exists = edges.some(
                (edge) => edge.from === selectedId && edge.to === nodeId
            );
            if (exists) {
                setSelectedId(nodeId);
                setTempNode(nodeId);
                setTempEdgeFrom(nodeId);
                setTempEdges([]);
                return;
            }

            const newEdge = { from: selectedId, to: nodeId };
            setTempEdges([newEdge]);
            setSelectedId(nodeId);
            setTempNode(nodeId);
            setTempEdgeTo(nodeId);
            setTempEdgeFrom(selectedId);
            const nodeA = getNodeById(selectedId);
            const nodeB = getNodeById(nodeId);
            setTempEdgeDist(
                getDistance(nodeA.lat, nodeA.lon, nodeB.lat, nodeB.lon)
            );
            if (edgeInputRef) edgeInputRef.current.focus();
        }
        setTempNodes([]);
    };

    const handleNodeContextMenu = (e, nodeId) => {
        e.evt.preventDefault();
        e.cancelBubble = true;
        setNodes((prev) => prev.filter((n) => n.id !== nodeId));
        setEdges((prev) =>
            prev.filter((edge) => edge.from !== nodeId && edge.to !== nodeId)
        );
        if (selectedId === nodeId) setSelectedId(null);
        resetTempNode(nodes.at(-1)?.id + 1);
    };

    const handleEdgeClick = (e, index) => {
        e.cancelBubble = true;
        if (e.evt.button !== 0) return;
        setSelectedId(null);
        resetTempNode(nodes?.at(-1)?.id + 1);
        setTempEdge(index);
        if (edgeInputRef) edgeInputRef.current.focus();
    };

    const handleEdgeContextMenu = (e, index) => {
        e.evt.preventDefault();
        e.cancelBubble = true;
        setEdges((prev) => prev.filter((_, i) => i !== index));
    };

    const invalidNode = () => {
        if (
            tempNodeType === "" ||
            tempNodeTier === "" ||
            tempNodeLat === "" ||
            tempNodeLon === ""
        )
            return true;
        return false;
    };

    const setTempNode = (nodeId) => {
        const selectedNode = getNodeById(nodeId);
        setTempNodeId(nodeId);
        setTempNodeName(selectedNode?.name);
        setTempNodeType(selectedNode?.type);
        setTempNodeTier(selectedNode?.tier);
        setTempNodeLat(selectedNode?.lat);
        setTempNodeLon(selectedNode?.lon);
    };

    const resetTempNode = (newId = null) => {
        setTempNodeId((prev) => (newId ? newId : prev + 1));
        setTempNodeName("");
        setTempNodeType("");
        setTempNodeTier("");
        setTempNodeLat("");
        setTempNodeLon("");
    };

    const invalidEdge = () => {
        if (
            tempEdgeType === "" ||
            tempEdgeTo === "" ||
            tempEdgeFrom === "" ||
            tempEdgeDist === ""
        )
            return true;
        return false;
    };

    const setTempEdge = (index) => {
        const selectedEdge = edges.find((_, i) => i === index);
        setTempEdgeName(selectedEdge?.name);
        setTempEdgeFrom(selectedEdge?.from);
        setTempEdgeTo(selectedEdge?.to);
        setTempEdgeDist(selectedEdge?.dist);
        setTempEdgeType(selectedEdge?.type);
    };

    const resetTempEdge = () => {
        setTempEdgeName("");
        setTempEdgeTo("");
        setTempEdgeType("");
        setTempEdgeDist("");
    };

    const saveNode = (e) => {
        e.preventDefault();
        if (invalidNode()) return;
        const updatedNode = nodes.find((node) => node.id === tempNodeId);
        if (updatedNode) {
            setNodes((prev) =>
                prev.map((node) =>
                    node.id === tempNodeId
                        ? {
                              id: tempNodeId,
                              name: tempNodeName,
                              type: tempNodeType,
                              tier: tempNodeTier,
                              lon: tempNodeLon,
                              lat: tempNodeLat,
                              nearId: 0,
                          }
                        : node
                )
            );
            alert("Node updated successfully");
        } else {
            const newNode = {
                id: tempNodeId,
                lat: tempNodeLat,
                lon: tempNodeLon,
                name: tempNodeName,
                type: tempNodeType,
                tier: tempNodeTier,
                nextId: 0,
            };
            setNodes((prev) => [...prev, newNode]);
            resetTempNode();
        }
        e.target.reset();
    };

    const saveEdge = (e) => {
        e.preventDefault();
        if (invalidEdge()) return;
        const updatedEdge = edges.find(
            (edge) => edge.from === tempEdgeFrom && edge.to === tempEdgeTo
        );
        if (updatedEdge) {
            setEdges((prev) =>
                prev.map((edge) =>
                    edge.from === tempEdgeFrom && edge.to === tempEdgeTo
                        ? {
                              name: tempEdgeName,
                              type: tempEdgeType,
                              dist: tempEdgeDist,
                              from: tempEdgeFrom,
                              to: tempEdgeTo,
                          }
                        : edge
                )
            );
            alert("Edge updated successfully");
        } else {
            const newEdge = {
                dist: tempEdgeDist,
                to: tempEdgeTo,
                from: tempEdgeFrom,
                name: tempEdgeName,
                type: tempEdgeType,
            };
            setEdges((prev) => [...prev, newEdge]);
            resetTempEdge();
            setTempEdges([]);
        }
        e.target.reset();
    };

    return (
        <div className={styles["map-builder"]} ref={containerRef}>
            <Stage
                ref={stageRef}
                width={dimensions.width}
                height={dimensions.height}
                draggable
                onWheel={handleWheel}
                onClick={
                    travelMode === "walk"
                        ? handleStageClickWalk
                        : handleStageClick
                }
                scaleX={scale}
                scaleY={scale}
                x={position.x}
                y={position.y}
                onDragEnd={(e) => {
                    setPosition({ x: e.target.x(), y: e.target.y() });
                }}
            >
                <Layer>
                    {travelMode === "walk" ? (
                        <KonvaImage image={gridImage} />
                    ) : (
                        <KonvaImage
                            image={
                                viewType === "Flat" ? imageMapFlat : imageMapSat
                            }
                        />
                    )}
                </Layer>

                {travelMode !== "walk" && (
                    <Layer>
                        {edges.map((edge, i) => {
                            const nodeA = getNodeById(edge.from);
                            const nodeB = getNodeById(edge.to);
                            if (!nodeA || !nodeB) return null;
                            const posA = latLonToPixel(nodeA.lat, nodeA.lon);
                            const posB = latLonToPixel(nodeB.lat, nodeB.lon);
                            const isTwoWay = edgeLookup.has(
                                `${edge.to}-${edge.from}`
                            );
                            return isTwoWay ? (
                                <Line
                                    key={i}
                                    points={[posA.x, posA.y, posB.x, posB.y]}
                                    stroke="black"
                                    strokeWidth={3 / scale}
                                    hitStrokeWidth={10 / scale}
                                    onClick={(e) => handleEdgeClick(e, i)}
                                    onContextMenu={(e) =>
                                        handleEdgeContextMenu(e, i)
                                    }
                                />
                            ) : (
                                <Arrow
                                    key={i}
                                    points={[posA.x, posA.y, posB.x, posB.y]}
                                    stroke="green"
                                    fill="green"
                                    strokeWidth={3 / scale}
                                    pointerLength={10 / scale}
                                    pointerWidth={10 / scale}
                                    hitStrokeWidth={10 / scale}
                                    onClick={(e) => handleEdgeClick(e, i)}
                                    onContextMenu={(e) =>
                                        handleEdgeContextMenu(e, i)
                                    }
                                />
                            );
                        })}
                        {tempEdges.map((edge, i) => {
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
                                />
                            );
                        })}
                        {tempNodes.map((node, i) => {
                            const { x, y } = latLonToPixel(node.lat, node.lon);
                            return (
                                <Circle
                                    key={i}
                                    x={x}
                                    y={y}
                                    radius={7}
                                    fill={"cyan"}
                                    stroke="black"
                                    strokeWidth={1}
                                    scaleX={1 / scale}
                                    scaleY={1 / scale}
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
                                    radius={isSelected ? 9 : 7}
                                    fill={isSelected ? "red" : "yellow"}
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
                )}

                <Layer>
                    <NodeLabel nodes={nodes} stageScale={scale}></NodeLabel>
                    <EdgeLabel
                        edges={edges}
                        nodes={nodes}
                        stageScale={scale}
                    ></EdgeLabel>
                </Layer>
            </Stage>

            {/* Forms For Nodes & Edges Manipulation */}
            {travelMode !== "walk" && (
                <form
                    className={
                        styles["dev-form"] + " " + styles["dev-form-node"]
                    }
                    onSubmit={(e) => saveNode(e)}
                >
                    <input
                        ref={nodeInputRef}
                        value={tempNodeName}
                        type="text"
                        placeholder="Node Name"
                        onChange={(e) => setTempNodeName(e.target.value)}
                    />
                    <select
                        value={tempNodeType}
                        onChange={(e) => {
                            setTempNodeType(e.target.value);
                            setTempNodeTier(getNodeTier(e.target.value));
                        }}
                        required
                    >
                        <option value="" disabled>
                            Select Node Type
                        </option>
                        <option value="cafe">Cafe (Center)</option>
                        <option value="hostel">Hostel (Center)</option>
                        <option value="dept">Department (Center)</option>
                        <option value="ground">Ground (Center)</option>
                        <option value="worship">Worship Place (Center)</option>
                        <option value="wall">Wall (Building corners)</option>
                        <option value="service">
                            Entrance, Gate, Office, Library, Services
                        </option>
                        <option value="intersection">Road, Street, etc.</option>
                        <option value="other">Other</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Tier"
                        value={tempNodeTier}
                        disabled
                        required
                    />
                    <input
                        type="text"
                        placeholder="Longitude"
                        value={tempNodeLon}
                        disabled
                        required
                    />
                    <input
                        type="text"
                        placeholder="Latitude"
                        value={tempNodeLat}
                        disabled
                        required
                    />
                    <button type="submit">Save Node</button>
                </form>
            )}
            {travelMode !== "walk" && (
                <form
                    className={
                        styles["dev-form"] + " " + styles["dev-form-edge"]
                    }
                    onSubmit={(e) => {
                        saveEdge(e);
                    }}
                >
                    <input
                        ref={edgeInputRef}
                        type="text"
                        placeholder="Edge Name"
                        onChange={(e) => setTempEdgeName(e.target.value)}
                    />
                    <select
                        value={tempEdgeType}
                        onChange={(e) => {
                            setTempEdgeType(e.target.value);
                        }}
                        required
                    >
                        <option value="" disabled>
                            Select Edge Type
                        </option>
                        <option value="road">Road</option>
                        <option value="street">Street</option>
                        <option value="wall">Wall</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Distance"
                        value={tempEdgeDist}
                        disabled
                        required
                    />
                    <input
                        type="text"
                        placeholder="From"
                        value={tempEdgeFrom}
                        disabled
                        required
                    />
                    <input
                        type="text"
                        placeholder="To"
                        value={tempEdgeTo}
                        disabled
                        required
                    />
                    <button type="submit">Save Edge</button>
                </form>
            )}
            {travelMode !== "walk" && (
                <p id="debug">
                    {(selectedId ? `Selected ` : `Next `) +
                        `Node [ Id: ${tempNodeId} ]`}
                </p>
            )}
        </div>
    );
};

export default MapBuilder;
