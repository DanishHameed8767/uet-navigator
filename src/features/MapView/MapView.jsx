import styles from "./MapView.module.css";
import { useState, useEffect } from "react";
import { findPath } from "../../utils/pathFinding.js";
import { latLonToPixel } from "../../utils/mapHelper.js";
import {
    Stage,
    Layer,
    Image as KonvaImage,
    Circle,
    Line,
    Ring,
    Star,
} from "react-konva";

const MapView = ({
    nodes,
    edges,
    dimensions,
    scale,
    position,
    setPosition,
    viewType,
    travelMode,
    imageMapFlat,
    imageMapSat,
    walkMatrix,
    gridConfig,
    containerRef,
    stageRef,
    boundDrag,
    handleWheel,
}) => {
    const [walkStart, setWalkStart] = useState(null);
    const [walkEnd, setWalkEnd] = useState(null);
    const [walkPath, setWalkPath] = useState([]);

    useEffect(() => {
        if (!walkStart || !walkEnd || !gridConfig) {
            setWalkPath([]);
            return;
        }
        console.time("A* Pathfinding");
        const pathNodes = findPath(walkMatrix, walkStart, walkEnd);
        console.timeEnd("A* Pathfinding");

        if (pathNodes) {
            const pixelPoints = pathNodes.flatMap((p) => [
                p.col * gridConfig.cellWidth + gridConfig.cellWidth / 2,
                p.row * gridConfig.cellHeight + gridConfig.cellHeight / 2,
            ]);
            setWalkPath(pixelPoints);
        } else {
            alert("No path found! (Are you surrounded by walls?)");
            setWalkPath([]);
        }
    }, [walkStart, walkEnd, gridConfig]);

    const handleStageClick = (e) => {
        if (travelMode !== "walk" || !gridConfig) return;
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
        if (walkMatrix[row][col] === 0) {
            return;
        }
        const point = { row, col };
        if (!walkStart) {
            setWalkStart(point);
        } else if (!walkEnd) {
            setWalkEnd(point);
        } else {
            setWalkStart(point);
            setWalkEnd(null);
        }
    };

    const getNodeById = (id) => {
        return nodes.find((n) => n.id === id);
    };

    return (
        <div className={styles["map-view"]} ref={containerRef}>
            <Stage
                ref={stageRef}
                width={dimensions.width}
                height={dimensions.height}
                draggable
                dragBoundFunc={boundDrag}
                onClick={handleStageClick}
                onWheel={handleWheel}
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
                </Layer>
                {travelMode === "walk" ? (
                    <Layer>
                        {walkPath.length > 0 && (
                            <Line
                                points={walkPath}
                                stroke="hsla(200, 100%, 50%, 1.00)"
                                strokeWidth={10 / scale}
                                lineCap="round"
                                lineJoin="round"
                                tension={0.1}
                                listening={false}
                            />
                        )}
                        {walkStart && (
                            <>
                                <Circle
                                    x={
                                        walkStart.col * gridConfig.cellWidth +
                                        gridConfig.cellWidth / 2
                                    }
                                    y={
                                        walkStart.row * gridConfig.cellHeight +
                                        gridConfig.cellHeight / 2
                                    }
                                    radius={8 / scale}
                                    fill="hsla(220, 100%, 20%, 1.00)"
                                    stroke="black"
                                    strokeWidth={2 / scale}
                                />
                                <Ring
                                    x={
                                        walkStart.col * gridConfig.cellWidth +
                                        gridConfig.cellWidth / 2
                                    }
                                    y={
                                        walkStart.row * gridConfig.cellHeight +
                                        gridConfig.cellHeight / 2
                                    }
                                    innerRadius={12 / scale}
                                    outerRadius={16 / scale}
                                    fill="hsla(220, 100%, 20%, 1.00)"
                                    opacity={0.5}
                                />
                            </>
                        )}
                        {walkEnd && (
                            <>
                                <Circle
                                    x={
                                        walkEnd.col * gridConfig.cellWidth +
                                        gridConfig.cellWidth / 2
                                    }
                                    y={
                                        walkEnd.row * gridConfig.cellHeight +
                                        gridConfig.cellHeight / 2
                                    }
                                    radius={8 / scale}
                                    fill="hsla(220, 100%, 20%, 1.00)"
                                    stroke="black"
                                    strokeWidth={2 / scale}
                                />
                                <Ring
                                    x={
                                        walkEnd.col * gridConfig.cellWidth +
                                        gridConfig.cellWidth / 2
                                    }
                                    y={
                                        walkEnd.row * gridConfig.cellHeight +
                                        gridConfig.cellHeight / 2
                                    }
                                    numPoints={5}
                                    innerRadius={12 / scale}
                                    outerRadius={16 / scale}
                                    fill="hsla(220, 100%, 20%, 1.00)"
                                    opacity={0.5}
                                />
                            </>
                        )}
                    </Layer>
                ) : (
                    <Layer>
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
                                    stroke="black"
                                    strokeWidth={3 / scale}
                                />
                            );
                        })}
                        {nodes.map((node) => {
                            const { x, y } = latLonToPixel(node.lat, node.lon);
                            return (
                                <Circle
                                    key={node.id}
                                    x={x}
                                    y={y}
                                    radius={7}
                                    fill={"yellow"}
                                    stroke="black"
                                    strokeWidth={1}
                                    scaleX={1 / scale}
                                    scaleY={1 / scale}
                                />
                            );
                        })}
                    </Layer>
                )}
            </Stage>
        </div>
    );
};

export default MapView;
