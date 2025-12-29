import React from "react";
import { Shape } from "react-konva";
import { latLonToPixel } from "../../utils/mapHelper.js";

const StaticNodes = React.memo(
    ({ nodes }) => {
        const renderNodes = (context, shape) => {
            context.beginPath();
            for (const node of nodes) {
                const { x, y } = latLonToPixel(node.lat, node.lon);
                context.moveTo(x + 14, y);
                context.arc(x, y, 14, 0, Math.PI * 2, false);
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
