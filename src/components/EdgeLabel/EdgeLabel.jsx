import { Text, Label, Tag } from "react-konva";
import { latLonToPixel } from "../../utils/mapHelper";

const EdgeLabel = ({ edges, nodes, stageScale }) => {
    return (
        <>
            {edges.map((edge, i) => {
                const nodeA = nodes.find((n) => n.id === edge.from);
                const nodeB = nodes.find((n) => n.id === edge.to);
                if (!nodeA || !nodeB || !edge.name) return null;
                const posA = latLonToPixel(nodeA.lat, nodeA.lon);
                const posB = latLonToPixel(nodeB.lat, nodeB.lon);
                const midX = (posA.x + posB.x) / 2;
                const midY = (posA.y + posB.y) / 2;
                return (
                    <Label key={`edge-label-${i}`} x={midX} y={midY}>
                        <Tag
                            fill="white"
                            opacity={0.7}
                            cornerRadius={3}
                            pointerEvents="none"
                        />
                        <Text
                            text={edge.name}
                            fontSize={10 / stageScale}
                            padding={2 / stageScale}
                            fill="black"
                            align="center"
                        />
                    </Label>
                );
            })}
        </>
    );
};

export default EdgeLabel;
