import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Circle, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { MAP_WIDTH, MAP_HEIGHT, projectLatLon } from "../utils/osmHelpers";

function BackgroundMap({ src }) {
  const [image] = useImage(src);
  return <KonvaImage image={image} width={MAP_WIDTH} height={MAP_HEIGHT} />;
}

export default function MapCanvas() {
  const stageRef = useRef(null);
  const [osm, setOsm] = useState(null);
  const [projectedNodes, setProjectedNodes] = useState({});
  const [scale, setScale] = useState(0.5); // initial zoom
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetch("/data/uet_clean.json")
      .then((res) => res.json())
      .then((data) => {
        setOsm(data);

        const projNodes = {};
        for (const [id, n] of Object.entries(data.nodes)) {
          projNodes[id] = projectLatLon(n.lat, n.lon);
        }
        setProjectedNodes(projNodes);
      });
  }, []);

  // zoom with mouse wheel
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = scale;
    const scaleBy = 1.05;
    const mousePoint = stage.getPointerPosition();

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // keep zoom centered on mouse position
    const mousePointTo = {
      x: (mousePoint.x - position.x) / oldScale,
      y: (mousePoint.y - position.y) / oldScale,
    };

    const newPos = {
      x: mousePoint.x - mousePointTo.x * newScale,
      y: mousePoint.y - mousePointTo.y * newScale,
    };

    setScale(newScale);
    setPosition(newPos);
  };

  if (!osm || Object.keys(projectedNodes).length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-200">
        Loading map...
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-slate-900">
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        scale={{ x: scale, y: scale }}
        position={position}
        onWheel={handleWheel}
        draggable
      >
        {/* Background PNG */}
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

            if (pts.length < 4) return null; // need at least 2 points

            const isFoot = way.type === "footway" || way.type === "path";

            return (
              <Line
                key={way.id}
                points={pts}
                stroke={isFoot ? "#7dd3fc" : "#e5e7eb"} // cyan for footway, light gray for roads
                strokeWidth={isFoot ? 2 : 3}
                lineCap="round"
                lineJoin="round"
                opacity={0.9}
              />
            );
          })}
        </Layer>

        {/* Nodes (small dots) – optional, can be toggled */}
        <Layer>
          {Object.entries(projectedNodes).map(([id, p]) => (
            <Circle
              key={id}
              x={p.x}
              y={p.y}
              radius={2}
              fill="#22c55e"
              opacity={0.8}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
