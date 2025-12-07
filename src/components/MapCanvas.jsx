import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Circle, Image as KonvaImage } from "react-konva";
import useImage from "use-image";

import {
  MAP_WIDTH,
  MAP_HEIGHT,
  buildProjectedNodes,
  unproject,
  findNearestNode,
} from "../utils/osmHelpers";

function BackgroundMap({ src }) {
  const [image] = useImage(src);
  if (!image) return null;
  return <KonvaImage image={image} width={MAP_WIDTH} height={MAP_HEIGHT} />;
}

export default function MapCanvas() {
  const stageRef = useRef(null);

  const [osm, setOsm] = useState(null);
  const [projectedNodes, setProjectedNodes] = useState({});
  const [scale, setScale] = useState(0.5);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);

  // Load OSM JSON once
  useEffect(() => {
    fetch("/data/uet_clean.json")
      .then((res) => res.json())
      .then((data) => {
        setOsm(data);
        setProjectedNodes(buildProjectedNodes(data.nodes));
      })
      .catch((err) => console.error("Error loading OSM JSON:", err));
  }, []);

  // Zoom with mouse wheel
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = scale;
    const scaleBy = 1.05;
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setScale(newScale);
    setPosition(newPos);
  };

  // Clicking anywhere on the map (including roads/empty space)
  // -> find nearest node (start first, then end).
  const handleMapClick = (e) => {
    if (!osm) return;
    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();

    // screen coords -> canvas coords
    const canvasX = (pointer.x - position.x) / scale;
    const canvasY = (pointer.y - position.y) / scale;

    // canvas -> lat/lon
    const { lat, lon } = unproject(canvasX, canvasY);

    // find nearest node in raw OSM nodes
    const nearestId = findNearestNode(lat, lon, osm.nodes);
    if (!nearestId) return;

    if (!startNode) {
      setStartNode(nearestId);
    } else if (!endNode) {
      setEndNode(nearestId);
    } else {
      // if both already set, start over with new start
      setStartNode(nearestId);
      setEndNode(null);
    }

    console.log("Clicked at lat/lon:", lat, lon, "nearest node:", nearestId);
  };

  // Exact node click (on the green dots) – stops event bubbling so Stage
  // onClick doesn't also fire.
  const handleExactNodeClick = (e, id) => {
    e.cancelBubble = true;
    if (!startNode) {
      setStartNode(id);
    } else if (!endNode) {
      setEndNode(id);
    } else {
      setStartNode(id);
      setEndNode(null);
    }
  };

  const handleClearSelection = () => {
    setStartNode(null);
    setEndNode(null);
  };

  if (!osm || Object.keys(projectedNodes).length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-slate-100">
        Loading map...
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-slate-900 flex flex-col">
      {/* Top control bar */}
      <div className="z-10 flex items-center gap-4 bg-slate-800 text-slate-100 px-4 py-2 text-sm shadow">
        <span>
          Start:{" "}
          <span className="font-mono">{startNode ?? "click map to set"}</span>
        </span>
        <span>
          End:{" "}
          <span className="font-mono">{endNode ?? "click again to set"}</span>
        </span>
        <button
          onClick={handleClearSelection}
          className="ml-auto rounded bg-sky-500 px-3 py-1 text-xs font-semibold hover:bg-sky-400"
        >
          Clear
        </button>
      </div>

      {/* Map canvas */}
      <div className="flex-1">
        <Stage
          ref={stageRef}
          width={window.innerWidth}
          height={window.innerHeight}
          scale={{ x: scale, y: scale }}
          position={position}
          onWheel={handleWheel}
          draggable
          onClick={handleMapClick}
        >
          {/* Background map PNG */}
          <Layer>
            <BackgroundMap src="/images/uet_map.png" />
          </Layer>

          {/* Roads */}
          <Layer>
            {osm.ways.map((way) => {
              const pts = [];
              for (const id of way.refs) {
                const p = projectedNodes[id];
                if (!p) continue;
                pts.push(p.x, p.y);
              }
              if (pts.length < 4) return null;

              const isFoot = way.type === "footway" || way.type === "path";

              return (
                <Line
                  key={way.id}
                  points={pts}
                  stroke={isFoot ? "#7dd3fc" : "#e5e7eb"}
                  strokeWidth={isFoot ? 2 : 3}
                  lineCap="round"
                  lineJoin="round"
                  opacity={0.9}
                />
              );
            })}
          </Layer>

          {/* Nodes */}
          <Layer>
            {Object.entries(projectedNodes).map(([id, p]) => {
              const isStart = id === startNode;
              const isEnd = id === endNode;

              return (
                <Circle
                  key={id}
                  x={p.x}
                  y={p.y}
                  radius={isStart || isEnd ? 5 : 3}
                  fill={isStart ? "#22c55e" : isEnd ? "#ef4444" : "#4ade80"}
                  stroke="#064e3b"
                  strokeWidth={isStart || isEnd ? 1 : 0}
                  opacity={0.9}
                  onClick={(e) => handleExactNodeClick(e, id)}
                />
              );
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
