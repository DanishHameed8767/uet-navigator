import React from "react";
import { Shape } from "react-konva";
import { latLonToPixel } from "../../utils/mapHelper.js";

const StaticEdges = React.memo(
    ({ edges, nodeLookup }) => {
        const renderEdges = (context, shape) => {
            context.beginPath();
            context.strokeStyle = "black";
            context.lineWidth = 2;

            for (const edge of edges) {
                const nA = nodeLookup[edge.from];
                const nB = nodeLookup[edge.to];
                if (!nA || !nB) continue;

                const posA = latLonToPixel(nA.lat, nA.lon);
                const posB = latLonToPixel(nB.lat, nB.lon);
                if (edge.twoWay) {
                    context.moveTo(posA.x, posA.y);
                    context.lineTo(posB.x, posB.y);
                } else {
                    const angle = Math.atan2(posB.y - posA.y, posB.x - posA.x);
                    const gap = 14;
                    const endX = posB.x - gap * Math.cos(angle);
                    const endY = posB.y - gap * Math.sin(angle);
                    drawArrow(context, posA.x, posA.y, endX, endY);
                }
            }
            context.strokeShape(shape);
        };

        return (
            <Shape
                sceneFunc={renderEdges}
                listening={false}
                stroke="black"
                strokeWidth={2}
                strokeScaleEnabled={false}
            />
        );
    },
    (prev, next) =>
        prev.edges === next.edges && prev.nodeLookup === next.nodeLookup
);

function drawArrow(ctx, fromX, fromY, toX, toY) {
    const headlen = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.moveTo(toX, toY);
    ctx.lineTo(
        toX - headlen * Math.cos(angle - Math.PI / 6),
        toY - headlen * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
        toX - headlen * Math.cos(angle + Math.PI / 6),
        toY - headlen * Math.sin(angle + Math.PI / 6)
    );
}

export default StaticEdges;
