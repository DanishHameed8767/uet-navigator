import useImage from "use-image";
import { Stage, Layer, Image } from "react-konva";
import { useState, useRef } from "react";

export default function MapCanvas() {
  const stageRef = useRef();
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleWheel = (e) => {
    e.evt.preventDefault();

    const scaleBy = 1.05;
    const oldScale = scale;

    const pointer = stageRef.current.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    setScale(newScale);

    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth}
      height={window.innerHeight}
      scale={{ x: scale, y: scale }}
      position={position}
      onWheel={handleWheel}
      draggable
    >
      <Layer>
        <BackgroundMap src="/" />
      </Layer>
    </Stage>
  );
}

function BackgroundMap({ src }) {
  const [image] = useImage(src);
  return <Image image={image} />;
}
