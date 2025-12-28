import styles from "./MapView.module.css";
import { findPath } from "../../utils/pathFinding.js";
import { MAP_CONFIG } from "../../utils/mapHelper.js";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Circle,
  Line,
  Ring,
} from "react-konva";

const MapView = ({
  dimensions,
  scale,
  position,
  setPosition,
  viewType,
  travelMode,
  stops,
  setStops,
  imageMapFlat,
  imageMapSat,
  walkMatrix,
  gridConfig,
  containerRef,
  stageRef,
  boundDrag,
  handleWheel,
  handleStopSave,
}) => {
  const travelPath = (() => {
    if (travelMode !== "walk") {
      return [];
    }

    if (!gridConfig || stops.length < 2) {
      return [];
    }

    let pixelPoints = [];

    for (let i = 0; i < stops.length - 1; i++) {
      const start = imageToGridXY(
        stops[i].point.x,
        stops[i].point.y,
        gridConfig
      );
      const end = imageToGridXY(
        stops[i + 1].point.x,
        stops[i + 1].point.y,
        gridConfig
      );

      const pathNodes = findPath(walkMatrix, start, end);
      pixelPoints.push(
        ...pathNodes.flatMap((p) => [
          p.col * gridConfig.cellWidth + gridConfig.cellWidth / 2,
          p.row * gridConfig.cellHeight + gridConfig.cellHeight / 2,
        ])
      );
    }

    return pixelPoints;
  })();

  const handleStageClick = (e) => {
    if (e.evt.button !== 0) {
      return;
    }
    if (travelMode === "walk" && !gridConfig) {
      return;
    }
    if (stops.length === MAP_CONFIG.MAX_STOPS) {
      alert("Cannot add more than " + MAP_CONFIG.MAX_STOPS + " stops.");
      return;
    }
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    const imgX = (pointer.x - stage.x()) / stage.scaleX();
    const imgY = (pointer.y - stage.y()) / stage.scaleY();
    if (travelMode === "walk") {
      const point = imageToGridXY(imgX, imgY, gridConfig);
      if (walkMatrix[point.row][point.col] === 0) {
        return;
      }
    }
    setStops((prev) => [
      ...prev,
      {
        // closest node:
        point: {
          x: imgX,
          y: imgY,
        },
      },
    ]);
  };

  const handleStopClick = (e, id) => {
    e.evt.preventDefault();
    e.cancelBubble = true;
    if (e.evt.button !== 0) {
      setStops((prev) =>
        prev.filter((stop) => `${stop.point.x}-${stop.point.y}` !== id)
      );
    }
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
        onDragEnd={(e) => {
          setPosition({ x: e.target.x(), y: e.target.y() });
        }}
      >
        <Layer>
          <KonvaImage
            image={viewType === "Flat" ? imageMapFlat : imageMapSat}
          />
        </Layer>
        <Layer>
          {travelPath.length > 0 && (
            <Line
              points={travelPath}
              stroke="hsla(200, 100%, 50%, 1.00)"
              strokeWidth={10 / scale}
              lineCap="round"
              lineJoin="round"
              tension={0.1}
              listening={false}
            />
          )}

          {stops.map((stop) => (
            <>
              <Circle
                key={`${stop.point.x}-${stop.point.y}`}
                x={stop.point.x}
                y={stop.point.y}
                radius={8 / scale}
                fill={getStopColor(travelMode)}
                stroke="black"
                strokeWidth={2 / scale}
                onClick={(e) => (e.cancelBubble = true)}
                onDblClick={() => handleStopSave(stop)}
                onContextMenu={(e) =>
                  handleStopClick(e, `${stop.point.x}-${stop.point.y}`)
                }
              />
              <Ring
                key={`${stop.point.x}+${stop.point.y}`}
                x={stop.point.x}
                y={stop.point.y}
                innerRadius={12 / scale}
                outerRadius={16 / scale}
                fill={getStopColor(travelMode)}
                opacity={0.5}
                onClick={(e) => (e.cancelBubble = true)}
                onDblClick={() => handleStopSave(stop)}
                onContextMenu={(e) =>
                  handleStopClick(e, `${stop.point.x}-${stop.point.y}`)
                }
              />
            </>
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default MapView;

const getStopColor = (travelMode) => {
  return travelMode === "bike"
    ? "hsla(50, 100%, 50%, 1.00)"
    : travelMode === "car"
    ? "hsla(0, 90%, 45%, 1.00)"
    : "hsla(220, 100%, 40%, 1.00)";
};

const imageToGridXY = (imgX, imgY, gridConfig) => {
  const col = Math.floor(imgX / gridConfig.cellWidth);
  const row = Math.floor(imgY / gridConfig.cellHeight);
  if (row < 0 || row >= gridConfig.rows || col < 0 || col >= gridConfig.cols) {
    return { row: 0, col: 0 };
  }
  return { row, col };
};
