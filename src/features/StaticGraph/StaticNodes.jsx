import React from "react";
import { Shape } from "react-konva";

const StaticNodes = React.memo(
    ({ nodes }) => {
        const renderNodes = (context, shape) => {
            context.beginPath();

            for (const node of nodes) {
                context.moveTo(node.x + 14, node.y);
                context.arc(node.x, node.y, 14, 0, Math.PI * 2, false);
            }

            context.fillStrokeShape(shape);
        };

        return (
            <Shape
                sceneFunc={renderNodes}
                fill="yellow"
                stroke="black"
                strokeWidth={2}
                strokeScaleEnabled={true}
            />
        );
    },
    (prev, next) => prev.nodes === next.nodes
);

export default StaticNodes;
