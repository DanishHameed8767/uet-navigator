import {
    Stage,
    Layer,
    Image as KonvaImage,
    Circle,
    Ring,
    Group,
} from "react-konva";
import styles from "./MapView.module.css";
import { MAP_CONFIG, snapToEntity, imageToGridXY } from "../../utils/mapHelper";
import MapRoutes from "../../components/MapRoutes/MapRoutes.jsx";
import MapMarker from "../../components/MapMarker/MapMarker.jsx";
import StaticLabels from "../StaticGraph/StaticLabels";

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
    filter,
    indexes,
}) => {
    const isWalkMode = travelMode === "walk";
    const highlightNodes =
        filter && indexes?.byType ? indexes?.byType?.get(filter) : [];

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
                                    innerRadius={8 / scale}
                                    outerRadius={16 / scale}
                                    fill={"hsla(200, 100%, 40%, 0.8)"}
                                    opacity={0.5}
                                    onClick={(e) => (e.cancelBubble = true)}
                                    onContextMenu={(e) =>
                                        handleStopRightClick(e, idx)
                                    }
                                />
                                <Circle
                                    radius={8 / scale}
                                    fill={"hsla(200, 100%, 40%, 0.8)"}
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

                    <StaticLabels
                        nodes={renderNodes}
                        edges={renderEdges}
                        nodeLookup={graphData?.nodes}
                        detailLevel={detailLevel}
                    />

                    {highlightNodes.map((nodeId, idx) => {
                        const node = graphData?.nodes[nodeId];
                        return (
                            <MapMarker
                                key={idx}
                                x={node.x}
                                y={node.y}
                                color={"gold"}
                                stroke={"black"}
                                scale={scale}
                            />
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
                            color={"hsla(0, 90%, 55%, 1.00)"}
                            stroke={"black"}
                            scale={scale}
                        />
                    )}
                </Layer>
            </Stage>
        </div>
    );
};

export default MapView;
