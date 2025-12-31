import styles from "./MapBuilder.module.css";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
    Stage,
    Layer,
    Arrow,
    Image as KonvaImage,
    Circle,
    Line,
    Group,
} from "react-konva";
import {
    createNodeLookup,
    findClosestNode,
    findClosestEdge,
    pixelToLatLon,
    latLonToPixel,
    getDistance,
    getNodeTier,
} from "../../utils/mapHelper.js";
import StaticEdges from "../StaticGraph/StaticEdges.jsx";
import StaticNodes from "../StaticGraph/StaticNodes.jsx";
import StaticLabels from "../StaticGraph/StaticLabels.jsx";
import {
    addEdge,
    addNode,
    deleteEdge,
    deleteNode,
    updateEdge,
    updateNode,
} from "../../utils/graphMutations.js";

const MapBuilder = ({
    graphData,
    setGraphData,
    graph,
    renderNodes,
    renderEdges,
    indexes, // optional, can ignore for now
    dimensions,
    scale,
    detailLevel,
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
    handleWheel,
}) => {
    const nodes = renderNodes;
    const edges = renderEdges;

    const [gridImage, setGridImage] = useState(null);

    const nodeInputRef = useRef(null);
    const edgeInputRef = useRef(null);
    const hitImgRef = useRef(null);
    const [selectedId, setSelectedId] = useState(null);

    const [tempNodes, setTempNodes] = useState([]);
    const [tempEdges, setTempEdges] = useState([]);

    const getNextNodeId = useCallback(() => {
        const ids = Object.keys(graphData.nodes || {}).map(Number);
        const max = ids.length ? Math.max(...ids) : 0;
        return max + 1;
    }, [graphData.nodes]);

    const [tempNode, setTempNode] = useState({
        id: getNextNodeId,
        name: "",
        type: "",
        tier: "",
        lat: "",
        lon: "",
    });

    const updateTempNode = (field, value) => {
        setTempNode((prev) => {
            const newState = { ...prev, [field]: value };
            if (field === "type") {
                newState.tier = getNodeTier(value);
            }
            console.log(newState);
            return newState;
        });
    };

    const [tempEdgeName, setTempEdgeName] = useState("");
    const [tempEdgeFrom, setTempEdgeFrom] = useState("");
    const [tempEdgeTo, setTempEdgeTo] = useState("");
    const [tempEdgeDist, setTempEdgeDist] = useState("");
    const [tempEdgeType, setTempEdgeType] = useState("");
    const [tempEdgeTwoWay, setTempEdgeTwoWay] = useState(false);

    const nodeLookup = useMemo(() => createNodeLookup(nodes), [nodes]);

    useEffect(() => {
        if (!gridConfig || !walkMatrix || travelMode !== "walk") {
            return;
        }
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
    }, [gridConfig, walkMatrix, imageMapFlat, travelMode]);

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
    }, [imageMapFlat, imageMapSat, viewType]);

    const getNodeById = (id) => {
        return graph.getNode(id);
    };

    const handleStageClick = (e) => {
        if (e.target.getClassName() === "Circle" || e.evt.button !== 0) {
            return;
        }
        const stage = e.target.getStage();

        const pointer = stage.getPointerPosition();
        const imageX = (pointer.x - stage.x()) / stage.scaleX();
        const imageY = (pointer.y - stage.y()) / stage.scaleX();

        const clickedNode = findClosestNode(imageX, imageY, nodes, 15 / scale);
        if (clickedNode) {
            handleNodeClick(e, clickedNode.id);
            return;
        }

        const clickedEdgeIndex = findClosestEdge(
            imageX,
            imageY,
            edges,
            nodeLookup,
            10 / scale
        );

        if (clickedEdgeIndex !== -1) {
            handleEdgeClick(e, clickedEdgeIndex);
            return;
        }

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
            if (pixel[3] < 10) {
                return;
            }
        }

        const { lat, lon } = pixelToLatLon(imageX, imageY);
        const newNode = { lat: lat, lon: lon };
        setTempEdges([]);
        setTempNodes([newNode]);
        setSelectedId(null);
        resetTempNode(getNextNodeId());
        updateTempNode("lat", lat);
        updateTempNode("lon", lon);
        if (nodeInputRef) {
            nodeInputRef.current.focus();
        }
    };

    const handleStageClickWalk = (e) => {
        e.cancelBubble = true;
        e.evt.preventDefault();
        if (!gridConfig || e.evt.button !== 0) {
            return;
        }
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
        ) {
            return;
        }
        setWalkMatrix((prev) => {
            const newMat = [...prev];
            const newRow = [...newMat[row]];
            newRow[col] = (newRow[col] + 1) % 2;
            newMat[row] = newRow;
            {
                return newMat;
            }
        });
    };

    const handleNodeClick = (e, nodeId) => {
        e.cancelBubble = true;
        if (e.evt.button !== 0) {
            return;
        }
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
            const nodeA = graph.getNode(selectedId);
            const nodeB = graph.getNode(nodeId);
            setTempEdgeDist(
                getDistance(nodeA.lat, nodeA.lon, nodeB.lat, nodeB.lon)
            );
            if (edgeInputRef) {
                edgeInputRef.current.focus();
            }
        }
        setTempNodes([]);
    };

    const handleNodeContextMenu = (e, nodeId) => {
        e.evt.preventDefault();
        e.cancelBubble = true;
        setGraphData((prev) => deleteNode(prev, nodeId));

        if (selectedId === nodeId) {
            setSelectedId(null);
        }
        resetTempNode(getNextNodeId());
    };

    const handleEdgeClick = (e, edge) => {
        e.cancelBubble = true;
        if (e.evt.button !== 0) {
            return;
        }

        setSelectedId(null);
        resetTempNode(getNextNodeId());

        setTempEdgeName(edge.name);
        setTempEdgeFrom(edge.from);
        setTempEdgeTo(edge.to);
        setTempEdgeDist(edge.dist);
        setTempEdgeType(edge.type);

        if (edgeInputRef) {
            edgeInputRef.current.focus();
        }
    };

    const handleEdgeContextMenu = (e, edge) => {
        e.evt.preventDefault();
        e.cancelBubble = true;
        setGraphData((prev) => deleteEdge(prev, edge.id));
        resetTempEdge();
    };

    const isValidNode = () => {
        if (
            tempNode.type === "" ||
            tempNode.tier === "" ||
            tempNode.lat === "" ||
            tempNode.lon === ""
        ) {
            return false;
        }
        return true;
    };

    const loadTempNodeFromGraph = (nodeId) => {
        const n = graph.getNode(nodeId);
        setTempNode({
            id: nodeId,
            name: n?.name || "",
            type: n?.type || "",
            tier: n?.tier || "",
            lat: n?.lat || "",
            lon: n?.lon || "",
        });
    };

    const resetTempNode = (newId = null) => {
        setTempNode((prev) => {
            return {
                id: newId ? newId : prev.id + 1,
                name: "",
                type: "",
                tier: "",
                lat: "",
                lon: "",
            };
        });
    };

    const invalidEdge = () => {
        if (
            tempEdgeType === "" ||
            tempEdgeTo === "" ||
            tempEdgeFrom === "" ||
            tempEdgeDist === ""
        ) {
            return true;
        }
        return false;
    };

    const resetTempEdge = () => {
        setTempEdgeName("");
        setTempEdgeTo("");
        setTempEdgeType("");
        setTempEdgeDist("");
        setTempEdgeTwoWay(false);
    };

    const saveNode = (e) => {
        e.preventDefault();
        if (!isValidNode()) {
            return;
        }

        const exists = nodes.some((node) => node.id === tempNode.id);

        if (exists) {
            setGraphData((prev) => updateNode(prev, tempNode.id, tempNode));
        } else {
            setGraphData((prev) => addNode(prev, tempNode));
        }

        resetTempNode(getNextNodeId());
    };

    const saveEdge = (e) => {
        e.preventDefault();
        if (invalidEdge()) return;

        const edgeId = `${tempEdgeFrom}-${tempEdgeTo}`;

        const exists = edges.some(
            (edge) => edge.from === tempEdgeFrom && edge.to === tempEdgeTo
        );

        if (exists) {
            setGraphData((prev) =>
                updateEdge(prev, edgeId, {
                    name: tempEdgeName,
                    type: tempEdgeType,
                    dist: tempEdgeDist,
                    twoWay: tempEdgeTwoWay,
                })
            );
            alert("Edge updated successfully");
        } else {
            setGraphData((prev) =>
                addEdge(prev, {
                    id: edgeId,
                    from: Number(tempEdgeFrom),
                    to: Number(tempEdgeTo),
                    type: tempEdgeType,
                    dist: Number(tempEdgeDist),
                    twoWay: tempEdgeTwoWay,
                    name: tempEdgeName,
                })
            );
        }

        resetTempEdge();
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
                        <Group listening={false}>
                            <StaticEdges
                                edges={edges}
                                nodeLookup={nodeLookup}
                            />
                            {tempEdges.map((edge, i) => {
                                const nodeA = getNodeById(edge.from);
                                const nodeB = getNodeById(edge.to);
                                if (!nodeA || !nodeB) {
                                    return null;
                                }
                                const posA = latLonToPixel(
                                    nodeA.lat,
                                    nodeA.lon
                                );
                                const posB = latLonToPixel(
                                    nodeB.lat,
                                    nodeB.lon
                                );
                                return (
                                    <Line
                                        key={i}
                                        points={[
                                            posA.x,
                                            posA.y,
                                            posB.x,
                                            posB.y,
                                        ]}
                                        stroke="blue"
                                        strokeWidth={2 / scale}
                                    />
                                );
                            })}
                            {tempNodes.map((node, i) => {
                                const { x, y } = latLonToPixel(
                                    node.lat,
                                    node.lon
                                );
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
                            <StaticNodes nodes={nodes} />
                        </Group>
                    </Layer>
                )}
                <Layer>
                    <Group listening={false}>
                        <StaticLabels
                            nodes={nodes}
                            nodeLookup={nodeLookup}
                            edges={edges}
                            detailLevel={detailLevel}
                        />
                    </Group>
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
                        value={tempNode.name}
                        type="text"
                        placeholder="Node Name"
                        onChange={(e) => updateTempNode("name", e.target.value)}
                    />
                    <select
                        value={tempNode.type}
                        onChange={(e) => updateTempNode("type", e.target.value)}
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
                        value={tempNode.tier}
                        disabled
                        required
                    />
                    <input
                        type="text"
                        placeholder="Longitude"
                        value={tempNode.lon}
                        disabled
                        required
                    />
                    <input
                        type="text"
                        placeholder="Latitude"
                        value={tempNode.lat}
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
                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={tempEdgeTwoWay}
                            onChange={(e) =>
                                setTempEdgeTwoWay(e.target.checked)
                            }
                        />
                        Two-way road
                    </label>
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
                        `Node [ Id: ${tempNode.id} ]`}
                </p>
            )}
        </div>
    );
};

export default MapBuilder;
