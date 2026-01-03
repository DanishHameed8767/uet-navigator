import React from "react";
import { Shape } from "react-konva";

const StaticNodes = React.memo(
    ({ nodes }) => {
        const renderNodes = (context, shape) => {
            const batches = {
                tier1: [],
                tier2: [],
                tier2_5: [],
                tier3: [],
            };

            // context.beginPath();

            for (const node of nodes) {
                if (node.tier === 1) {
                    batches.tier1.push(node);
                } else if (node.tier === 2) {
                    if (node.type !== "service") {
                        batches.tier2.push(node);
                    } else {
                        batches.tier2_5.push(node);
                    }
                } else {
                    batches.tier3.push(node);
                }
                // context.moveTo(node.x + 14, node.y);
                // context.arc(node.x, node.y, 14, 0, Math.PI * 2, false);
            }

            const colors = {
                tier1: "yellow",
                tier2: "orange",
                tier2_5: "red",
                tier3: "lightgray",
            };

            Object.keys(batches).forEach((key) => {
                const group = batches[key];
                if (group.length === 0) {
                    return;
                }

                context.beginPath();

                for (const node of group) {
                    context.moveTo(node.x + 14, node.y);
                    context.arc(node.x, node.y, 14, 0, Math.PI * 2, false);
                }

                context.fillStyle = colors[key];
                context.fill();

                context.lineWidth = 2;
                context.strokeStyle = "black";
                context.stroke();
            });

            context.fillStrokeShape(shape);
        };

        return (
            <Shape
                sceneFunc={renderNodes}
                // fill="yellow"
                // stroke="black"
                // strokeWidth={2}
                // strokeScaleEnabled={true}
            />
        );
    },
    (prev, next) => prev.nodes === next.nodes
);

export default StaticNodes;
