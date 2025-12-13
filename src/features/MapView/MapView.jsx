import styles from "./MapView.module.css";
import { Stage, Layer, Image as KonvaImage, Circle, Line } from "react-konva";
import { latLonToPixel } from "../../utils/mapHelper.js";

const MapView = ({
    nodes,
    edges,
    containerRef,
    stageRef,
    dimensions,
    scale,
    position,
    setPosition,
    viewType,
    imageMapFlat,
    imageMapSat,
    boundDrag,
    handleWheel,
}) => {
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
            </Stage>
        </div>
    );
};

export default MapView;
