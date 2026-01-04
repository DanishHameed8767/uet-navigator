import { useMemo } from "react";
import {
    Stage,
    Layer,
    Image as KonvaImage,
    Circle,
    Line,
    Ring,
    Group,
} from "react-konva";
import styles from "./MapView.module.css";
import MapMarker from "../../components/MapMarker/MapMarker.jsx";
import { MAP_CONFIG, snapToEntity, imageToGridXY } from "../../utils/mapHelper";
import StaticLabels from "../StaticGraph/StaticLabels";
import useImage from "use-image";
import MapRoutes from "../../components/MapRoutes/MapRoutes.jsx";
// import StaticEdges from "../StaticGraph/StaticEdges";
// import StaticNodes from "../StaticGraph/StaticNodes";

const MapView = ({
    graph,
    graphData,
    renderNodes,
    renderEdges,
    walkMatrix,
    gridConfig,
    stops,
    setStops,
    travelMode,
    dimensions,
    scale,
    detailLevel,
    position,
    setPosition,
    viewType,
    imageMapFlat,
    imageMapSat,
    containerRef,
    stageRef,
    boundDrag,
    handleWheel,
    handleStopSave,
    pointInfo,
    openPointInfo,
    routeResult,
    selectedRoute,
}) => {
    const isWalkMode = travelMode === "walk";

    const handleStageClick = (e) => {
        if (e.evt.button !== 0) {
            return;
        }
        if (stops.length >= MAP_CONFIG.MAX_STOPS) {
            alert(`Cannot add more than ${MAP_CONFIG.MAX_STOPS} stops.`);
            return;
        }

        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        const imgX = (pointer.x - stage.x()) / stage.scaleX();
        const imgY = (pointer.y - stage.y()) / stage.scaleY();

        if (isWalkMode) {
            if (!gridConfig) {
                return;
            }
            const gridPos = imageToGridXY(imgX, imgY, gridConfig);
            if (walkMatrix[gridPos.row]?.[gridPos.col] === 0) {
                return;
            }
        }

        const snap = snapToEntity(
            imgX,
            imgY,
            renderNodes,
            renderEdges,
            graphData?.nodes || {},
            graph
        );

        let clickedPoint;
        if (isWalkMode) {
            clickedPoint = { click: { x: imgX, y: imgY }, snap };
        } else {
            clickedPoint = { click: { x: snap.node.x, y: snap.node.y }, snap };
        }

        openPointInfo(clickedPoint);
    };

    const handleStopRightClick = (e, stopIndex) => {
        e.evt.preventDefault();
        e.cancelBubble = true;
        setStops((prev) => prev.filter((_, idx) => idx !== stopIndex));
    };

    return (
        <div className={styles["map-view"]} ref={containerRef}>
            <Stage
                ref={stageRef}
                width={dimensions.width}
                height={dimensions.height}
                scaleX={scale}
                scaleY={scale}
                x={position.x}
                y={position.y}
                draggable
                dragBoundFunc={boundDrag}
                onWheel={handleWheel}
                onClick={handleStageClick}
                onContextMenu={(e) => e.evt.preventDefault()}
                onDragEnd={(e) =>
                    setPosition({ x: e.target.x(), y: e.target.y() })
                }
            >
                <Layer>
                    <KonvaImage
                        image={viewType === "Flat" ? imageMapFlat : imageMapSat}
                    />
                </Layer>

                <Layer>
                    {/* <Group listening={false}>
                        <StaticEdges
                            edges={renderEdges}
                            nodeLookup={graphData?.nodes}
                        />
                        <StaticNodes nodes={renderNodes} />
                    </Group> */}

                    <MapRoutes
                        selectedRoute={selectedRoute}
                        scale={scale}
                        routeResult={routeResult}
                        isWalkMode={isWalkMode}
                    />

                    {stops.map((stop, idx) => {
                        const x = isWalkMode
                            ? stop.click.x
                            : (stop.snap?.node?.x ?? stop.click.x);
                        const y = isWalkMode
                            ? stop.click.y
                            : (stop.snap?.node?.y ?? stop.click.y);

                        return (
                            <Group key={idx} x={x} y={y}>
                                <Ring
                                    innerRadius={12 / scale}
                                    outerRadius={16 / scale}
                                    fill={getStopColor(travelMode)}
                                    opacity={0.5}
                                    onClick={(e) => (e.cancelBubble = true)}
                                    onContextMenu={(e) =>
                                        handleStopRightClick(e, idx)
                                    }
                                />
                                <Circle
                                    radius={8 / scale}
                                    fill={getStopColor(travelMode)}
                                    stroke="white"
                                    strokeWidth={2 / scale}
                                    onClick={(e) => (e.cancelBubble = true)}
                                    onDblClick={() => handleStopSave(stop)}
                                    onContextMenu={(e) =>
                                        handleStopRightClick(e, idx)
                                    }
                                />
                            </Group>
                        );
                    })}

                    {pointInfo && (
                        <MapMarker
                            x={
                                isWalkMode
                                    ? pointInfo?.stop?.click?.x
                                    : pointInfo?.stop?.snap?.node?.x
                            }
                            y={
                                isWalkMode
                                    ? pointInfo?.stop?.click?.y
                                    : pointInfo?.stop?.snap?.node?.y
                            }
                            color={"black"}
                            scale={scale}
                        />
                    )}

                    <StaticLabels
                        nodes={renderNodes}
                        edges={renderEdges}
                        nodeLookup={graphData?.nodes}
                        detailLevel={detailLevel}
                    />
                </Layer>
            </Stage>
        </div>
    );
};

const getStopColor = (mode) => {
    switch (mode) {
        case "bike":
            return "hsla(50, 100%, 50%, 1.00)";
        case "car":
            return "hsla(0, 90%, 55%, 1.00)";
        case "walk":
            return "hsla(220, 100%, 50%, 1.00)";
    }
};

export default MapView;
