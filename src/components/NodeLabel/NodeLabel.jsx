import { Text, Label, Tag } from "react-konva";
import { latLonToPixel } from "../../utils/mapHelper";

const NodeLabel = ({ nodes, stageScale }) => {
    return (
        <>
            {nodes.map((node) => {
                const { x, y } = latLonToPixel(node.lat, node.lon);
                if (!node.name) return null;
                return (
                    <Label
                        key={`node-label-${node.id}`}
                        x={x}
                        y={y - 15 / stageScale}
                    >
                        <Tag
                            fill="rgba(0,0,0,0.6)"
                            cornerRadius={3}
                            pointerEvents="none"
                        />
                        <Text
                            text={node.name}
                            fontSize={12 / stageScale}
                            padding={4 / stageScale}
                            fill="white"
                            align="center"
                        />
                    </Label>
                );
            })}
        </>
    );
};

export default NodeLabel;
