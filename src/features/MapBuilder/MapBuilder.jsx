import styles from "./MapBuilder.module.css";
import React, { useState, useRef, useCallback } from "react";
import StaticEdges from "../StaticGraph/StaticEdges.jsx";
import StaticNodes from "../StaticGraph/StaticNodes.jsx";
import StaticLabels from "../StaticGraph/StaticLabels.jsx";
import {
    Stage,
    Layer,
    Circle,
    Line,
    Image as KonvaImage,
    Group,
} from "react-konva";
import {
    findClosestNode,
    findClosestEdge,
    pixelToLatLon,
    latLonToPixel,
    getDistance,
    getNodeTier,
} from "../../utils/mapHelper.js";
import {
    addEdge,
    addNode,
    deleteEdge,
    deleteNode,
    updateEdge,
    updateNode,
    isValidEdge,
    isValidNode,
} from "../../utils/graphMutations.js";
import MapBuildForms from "../../components/MapBuildForms/MapBuildForms.jsx";

const MapBuilder = ({
    graphData,
    setGraphData,
    renderNodes,
    renderEdges,
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
    const nodeInputRef = useRef(null);
    const edgeInputRef = useRef(null);
    // const hitImgRef = useRef(null);
    const [selectedNode, setSelectedNode] = useState(null);

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
            return newState;
        });
    };

    const setTempNodeFromGraph = (nodeId) => {
        const n = graphData.nodes[nodeId];
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

    const displayTempNode = () => {
        const { x, y } = latLonToPixel(tempNode.lat, tempNode.lon);
        return (
            <Circle
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
    };

    const saveNode = (e) => {
        e.preventDefault();
        if (isValidNode()) {
            if (graphData.nodes[tempNode.id]) {
                setGraphData((prev) => updateNode(prev, tempNode.id, tempNode));
            } else {
                setGraphData((prev) => addNode(prev, tempNode));
            }
            resetTempNode(getNextNodeId());
        }
    };

    const [tempEdge, setTempEdge] = useState({
        name: "",
        from: "",
        to: "",
        dist: "",
        type: "",
        twoWay: false,
    });

    const updateTempEdge = (field, value) => {
        setTempEdge((prev) => {
            return { ...prev, [field]: value };
        });
    };

    const resetTempEdge = () => {
        setTempEdge(() => {
            return {
                name: "",
                from: "",
                to: "",
                dist: "",
                type: "",
                twoWay: false,
            };
        });
    };

    const displayTempEdge = () => {
        const nodeA = graphData.nodes[tempEdge.from];
        const nodeB = graphData.nodes[tempEdge.to];
        if (!nodeA || !nodeB) {
            return null;
        }
        return (
            <Line
                points={[nodeA.x, nodeA.y, nodeB.x, nodeB.y]}
                stroke="blue"
                strokeWidth={3 / scale}
            />
        );
    };

    const saveEdge = (e) => {
        e.preventDefault();
        if (isValidEdge()) {
            const edgeId = `${tempEdge.from}-${tempEdge.to}`;
            if (graphData.edges[edgeId]) {
                setGraphData((prev) => updateEdge(prev, edgeId, tempEdge));
                alert("Edge updated successfully");
            } else {
                setGraphData((prev) =>
                    addEdge(prev, {
                        id: edgeId,
                        ...tempEdge,
                    })
                );
            }
            resetTempEdge();
        }
    };

    const gridImage = React.useMemo(() => {
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
        return canvas;
    }, [gridConfig, walkMatrix, travelMode, imageMapFlat]);

    const handleStageClick = (e) => {
        e.cancelBubble = true;
        e.evt.preventDefault();
        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        const imageX = (pointer.x - stage.x()) / stage.scaleX();
        const imageY = (pointer.y - stage.y()) / stage.scaleY();

        travelMode === "walk"
            ? handleStageClickWalk(imageX, imageY)
            : handleStageClickVehicle(e, imageX, imageY);
    };

    const handleStageClickVehicle = (e, imageX, imageY) => {
        const clickedNode = findClosestNode(
            imageX,
            imageY,
            renderNodes,
            15 / scale
        );
        if (clickedNode) {
            return e.evt.button === 0 // is-left-click
                ? handleNodeClick(clickedNode)
                : handleNodeContextMenu(clickedNode);
        }

        const clickedEdge = findClosestEdge(
            imageX,
            imageY,
            renderEdges,
            graphData.nodes,
            10 / scale
        );
        if (clickedEdge) {
            return e.evt.button === 0 // is-left-click
                ? handleEdgeClick(clickedEdge)
                : handleEdgeContextMenu(clickedEdge);
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

        // if (hitImgRef.current) {
        //     const pixel = hitImgRef.current.getImageData(
        //         Math.floor(imageX),
        //         Math.floor(imageY),
        //         1,
        //         1
        //     ).data;
        //     if (pixel[3] < 10) {
        //         return;
        //     }
        // }

        let { lat, lon } = pixelToLatLon(imageX, imageY);
        setSelectedNode(null);
        resetTempNode(getNextNodeId());
        updateTempNode("lat", lat);
        updateTempNode("lon", lon);
        if (nodeInputRef) {
            nodeInputRef.current.focus();
        }
    };

    const handleStageClickWalk = (imageX, imageY) => {
        if (!gridConfig) {
            return;
        }
        const col = Math.floor(imageX / gridConfig.cellWidth);
        const row = Math.floor(imageY / gridConfig.cellHeight);
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

            // Do Nine Pixels Per Click:
            const newRow1 = [...newMat[row - 1]];
            const newRow2 = [...newMat[row]];
            const newRow3 = [...newMat[row + 1]];

            const newPx = (newRow2[col] + 1) % 2;

            newRow1[col - 1] = newPx;
            newRow1[col] = newPx;
            newRow1[col + 1] = newPx;
            newRow2[col - 1] = newPx;
            newRow2[col] = newPx;
            newRow2[col + 1] = newPx;
            newRow3[col - 1] = newPx;
            newRow3[col] = newPx;
            newRow3[col + 1] = newPx;

            newMat[row - 1] = newRow1;
            newMat[row] = newRow2;
            newMat[row + 1] = newRow3;

            // Do One Pixel Per Click:
            // const newMat = [...prev];
            // const newRow = [...newMat[row]];
            // newRow[col] = (newRow[col] + 1) % 2;
            // newMat[row] = newRow;
            return newMat;
        });
    };

    const handleNodeClick = (node) => {
        if (selectedNode === null) {
            setSelectedNode(node);
            const { lat, lon } = pixelToLatLon(node.x, node.y);
            setTempNode({ ...node, lat, lon });
            updateTempEdge("from", node.id);
        } else if (selectedNode.id === node.id) {
            setSelectedNode(null);
            resetTempNode();
            updateTempNode("id", getNextNodeId());
            resetTempEdge();
        } else {
            // Duplicate Check
            if (graphData.edges[`${selectedNode.id}-${node.id}`]) {
                setSelectedNode(node);
                const { lat, lon } = pixelToLatLon(node.x, node.y);
                setTempNode({ ...node, lat, lon });
                updateTempEdge("from", node.id);
                return;
            }

            const sLoc = pixelToLatLon(selectedNode.x, selectedNode.y);
            const nLoc = pixelToLatLon(node.x, node.y);
            updateTempEdge("from", selectedNode.id);
            updateTempEdge("to", node.id);

            updateTempEdge(
                "dist",
                getDistance(sLoc.lat, sLoc.lon, nLoc.lat, nLoc.lon)
            );
            setSelectedNode(node);
            resetTempNode();
            if (edgeInputRef) {
                edgeInputRef.current.focus();
            }
        }
    };

    const handleNodeContextMenu = (node) => {
        setGraphData((prev) => deleteNode(prev, node.id));
        if (selectedNode && selectedNode.id === node.id) {
            setSelectedNode(null);
        }
        resetTempNode(getNextNodeId());
    };

    const handleEdgeClick = (edge) => {
        setSelectedNode(null);
        resetTempNode(getNextNodeId());
        setTempEdge(edge);
        if (edgeInputRef) {
            edgeInputRef.current.focus();
        }
    };

    const handleEdgeContextMenu = (edge) => {
        setGraphData((prev) => deleteEdge(prev, edge.id));
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

                <Layer>
                    {travelMode !== "walk" && (
                    <Group listening={false}>
                        {
                            <StaticEdges
                                edges={renderEdges}
                                nodeLookup={graphData.nodes}
                            />
                        }
                        {displayTempEdge()}
                        {displayTempNode()}
                        <StaticNodes nodes={renderNodes} />
                    </Group>
                    )}
                    <Group listening={false}>
                        {
                            <StaticLabels
                                nodes={renderNodes}
                                nodeLookup={graphData.nodes}
                                edges={renderEdges}
                                detailLevel={detailLevel}
                            />
                        }
                    </Group>
                </Layer>
            </Stage>

            <MapBuildForms
                travelMode={travelMode}
                selectedNode={selectedNode}
                tempNode={tempNode}
                updateTempNode={updateTempNode}
                nodeInputRef={nodeInputRef}
                saveNode={saveNode}
                tempEdge={tempEdge}
                updateTempEdge={updateTempEdge}
                edgeInputRef={edgeInputRef}
                saveEdge={saveEdge}
            />
        </div>
    );
};

export default MapBuilder;
