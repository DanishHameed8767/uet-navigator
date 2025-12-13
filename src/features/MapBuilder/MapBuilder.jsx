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
} from "../../utils/mapHelper.js";

const MapBuilder = ({
    nodes,
    edges,
    setNodes,
    setEdges,
    containerRef,
    stageRef,
    dimensions,
    scale,
    position,
    setPosition,
    viewType,
    imageMapFlat,
    imageMapSat,
    handleWheel,
}) => {
    const nodeInputRef = useRef(null);
    const edgeInputRef = useRef(null);
    const hitImgRef = useRef(null);
    const [selectedId, setSelectedId] = useState(null);

    const [tempNodes, setTempNodes] = useState([]);
    const [tempEdges, setTempEdges] = useState([]);

    const [tempNodeId, setTempNodeId] = useState(nodes.at(-1)?.id + 1);
    const [tempNodeName, setTempNodeName] = useState("");
    const [tempNodeTier, setTempNodeTier] = useState(0);
    const [tempNodeType, setTempNodeType] = useState("");
    const [tempNodeLat, setTempNodeLat] = useState(0);
    const [tempNodeLon, setTempNodeLon] = useState(0);

    const [tempEdgeName, setTempEdgeName] = useState("");
    const [tempEdgeFrom, setTempEdgeFrom] = useState("");
    const [tempEdgeTo, setTempEdgeTo] = useState("");
    const [tempEdgeDist, setTempEdgeDist] = useState(0);
    const [tempEdgeType, setTempEdgeType] = useState("");

    const edgeLookup = useMemo(() => {
        const lookup = new Set();
        edges.forEach((edge) => {
            lookup.add(`${edge.from}-${edge.to}`);
        });
        return lookup;
    }, [edges]);

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

    function getNodeTier(type) {
        if (type === "dept") return 1;
        if (type === "worship") return 1;
        if (type === "cafe") return 2;
        if (type === "hostel") return 2;
        if (type === "ground") return 2;
        if (type === "service") return 2;
        if (type === "wall") return 3;
        if (type === "intersection") return 3;
        if (type === "other") return 3;
        return 3;
    }

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
        setTempNodeLat(lat);
        setTempNodeLon(lon);
        if (nodeInputRef) nodeInputRef.current.focus();
    };

    const handleNodeClick = (e, nodeId) => {
        e.cancelBubble = true;
        if (e.evt.button !== 0) return;
        if (selectedId === null) {
            setSelectedId(nodeId);
            setTempEdgeFrom(nodeId);
        } else if (selectedId === nodeId) {
            setSelectedId(null);
            setTempEdgeFrom("");
        } else {
            // Duplicate Check
            const exists = edges.some(
                (edge) => edge.from === selectedId && edge.to === nodeId
            );
            if (exists) {
                setSelectedId(nodeId);
                setTempEdgeFrom(nodeId);
                return;
            }
            const newEdge = { from: selectedId, to: nodeId };
            setTempEdges([newEdge]);
            setSelectedId(nodeId);
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
    };

    const handleEdgeContextMenu = (e, index) => {
        e.evt.preventDefault();
        e.cancelBubble = true;
        setEdges((prev) => prev.filter((_, i) => i !== index));
    };

    const invalidNode = () => {
        if (
            tempNodeType === "" ||
            tempNodeTier === 0 ||
            tempNodeLat === 0 ||
            tempNodeLon === 0
        )
            return true;
        return false;
    };

    const resetTempNode = () => {
        setTempNodeId((prev) => prev + 1);
        setTempNodeName("");
        setTempNodeType("");
        setTempNodeTier(0);
        setTempNodeLat(0);
        setTempNodeLon(0);
    };

    const invalidEdge = () => {
        if (
            tempEdgeType === "" ||
            tempEdgeTo === "" ||
            tempEdgeFrom === "" ||
            tempEdgeDist === 0
        )
            return true;
        return false;
    };

    const resetTempEdge = () => {
        setTempEdgeName("");
        setTempEdgeTo("");
        setTempEdgeType("");
        setTempEdgeDist(0);
    };

    return (
        <div className={styles["map-builder"]} ref={containerRef}>
            <Stage
                ref={stageRef}
                width={dimensions.width}
                height={dimensions.height}
                draggable
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
                        image={viewType === "Flat" ? imageMapFlat : imageMapSat}
                    />
                    {edges.map((edge, i) => {
                        const nodeA = getNodeById(edge.from);
                        const nodeB = getNodeById(edge.to);
                        if (!nodeA || !nodeB) return null;
                        const posA = latLonToPixel(nodeA.lat, nodeA.lon);
                        const posB = latLonToPixel(nodeB.lat, nodeB.lon);
                        const hasReverse = edgeLookup.has(
                            `${edge.to}-${edge.from}`
                        );
                        const isOneWay = !hasReverse;
                        return isOneWay ? (
                            <Arrow
                                key={i}
                                points={[posA.x, posA.y, posB.x, posB.y]}
                                stroke="green"
                                fill="green"
                                strokeWidth={3 / scale}
                                pointerLength={10 / scale}
                                pointerWidth={10 / scale}
                                hitStrokeWidth={5 / scale}
                                onContextMenu={(e) =>
                                    handleEdgeContextMenu(e, i)
                                }
                            />
                        ) : (
                            <Line
                                key={i}
                                points={[posA.x, posA.y, posB.x, posB.y]}
                                stroke="black"
                                strokeWidth={3 / scale}
                                hitStrokeWidth={5 / scale}
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
            </Stage>

            {/* Dev Forms */}
            <form
                className={styles["dev-form"] + " " + styles["dev-form-node"]}
                onSubmit={(e) => {
                    e.preventDefault();
                    if (invalidNode()) return;
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
                    e.target.reset();
                }}
            >
                <input
                    ref={nodeInputRef}
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
                    <option value="cafe">Cafe</option>
                    <option value="hostel">Hostel (Center)</option>
                    <option value="dept">Department (Center)</option>
                    <option value="ground">Ground (Center)</option>
                    <option value="worship">Worship Place (Center)</option>
                    <option value="wall">Wall (Building corners)</option>
                    <option value="service">Office, Library, Gate</option>
                    <option value="intersection">Road, Street, etc.</option>
                    <option value="other">Other</option>
                </select>
                <input
                    type="text"
                    placeholder="Tier"
                    value={tempNodeTier > 0 ? tempNodeTier : ""}
                    disabled
                    required
                />
                <input
                    type="text"
                    placeholder="Longitude"
                    value={tempNodeLon > 0 ? tempNodeLon : ""}
                    disabled
                    required
                />
                <input
                    type="text"
                    placeholder="Latitude"
                    value={tempNodeLat > 0 ? tempNodeLat : ""}
                    disabled
                    required
                />
                <button type="submit">Save Node</button>
            </form>

            <form
                className={styles["dev-form"] + " " + styles["dev-form-edge"]}
                onSubmit={(e) => {
                    e.preventDefault();
                    if (invalidEdge()) return;
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
                    e.target.reset();
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
                    value={tempEdgeDist > 0 ? tempEdgeDist : ""}
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

            <p id="debug">
                {`Node [ Id: ${tempNodeId}, ` +
                    `Name: ${tempNodeName}, ` +
                    `Type: ${tempNodeType}, ` +
                    `Tier: ${tempNodeTier}, ` +
                    `Lon: ${tempNodeLon}, ` +
                    `Lat: ${tempNodeLat} ]`}
                <br></br>
                {`Edge [ Name: ${tempEdgeName}, ` +
                    `Type: ${tempEdgeType}, ` +
                    `To: ${tempEdgeTo}, ` +
                    `From: ${tempEdgeFrom}, ` +
                    `Dist: ${tempEdgeDist} ]`}
            </p>
        </div>
    );
};

export default MapBuilder;
