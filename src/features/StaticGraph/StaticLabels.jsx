import React from "react";
import { Shape } from "react-konva";
import { latLonToPixel } from "../../utils/mapHelper.js";

const StaticLabels = React.memo(
    ({ nodes, nodeLookup, edges, detailLevel }) => {
        const renderLabels = (context, shape) => {
            const fontSize = getFontSize(30, detailLevel);

            context.font = `bold ${fontSize}px Arial`;
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.lineJoin = "round";
            context.lineWidth = fontSize / 6;
            const lineHeight = fontSize * 1.2;
            const maxWidth = fontSize * 8;

            for (const node of nodes) {
                if (!node.name) continue;
                if (node.tier > detailLevel) continue;
                console.log(node.name);
                const { x, y } = latLonToPixel(node.lat, node.lon);
                const lines = getLines(context, node.name, maxWidth);
                const totalBlockHeight = lines.length * lineHeight;
                const startY = y - totalBlockHeight + lineHeight / 2;

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    const lineY = startY + i * lineHeight;
                    context.strokeStyle = "rgba(255, 255, 255, 1)";
                    context.strokeText(line, x, lineY);
                    context.fillStyle = "hsla(200, 15%, 45%, 1.00)";
                    context.fillText(line, x, lineY);
                }
            }

            const edgeFontSize = fontSize * 0.75;
            context.font = `bold ${edgeFontSize}px Arial`;
            context.lineWidth = edgeFontSize / 6;

            for (const edge of edges) {
                if (
                    !edge.name ||
                    edge.dist < 60 ||
                    edge.type === "wall" ||
                    (edge.type === "street" && detailLevel < 3)
                ) {
                    continue;
                }

                const nA = nodeLookup[edge.from];
                const nB = nodeLookup[edge.to];
                if (!nA || !nB) continue;

                const posA = latLonToPixel(nA.lat, nA.lon);
                const posB = latLonToPixel(nB.lat, nB.lon);

                const midX = (posA.x + posB.x) / 2;
                const midY = (posA.y + posB.y) / 2;

                let angle = Math.atan2(posB.y - posA.y, posB.x - posA.x);
                if (angle > Math.PI / 2 || angle < -Math.PI / 2) {
                    angle += Math.PI;
                }

                context.save();
                context.translate(midX, midY);
                context.rotate(angle);

                context.strokeStyle = "hsla(200, 15%, 40%, 1.00)";
                context.strokeText(edge.name, 0, 0);
                context.fillStyle = "rgba(255, 255, 255, 1)";
                context.fillText(edge.name, 0, 0);

                context.restore();
            }
        };

        return <Shape sceneFunc={renderLabels} listening={false} />;
    },
    (prev, next) =>
        prev.nodes === next.nodes && prev.detailLevel === next.detailLevel
);

const getLines = (ctx, text, maxWidth) => {
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
};

const getFontSize = (base, detailLevel) => {
    // 1 (Zoomed Out) -> +20px size
    // 5 (Zoomed In)  -> +0px size
    const size = base + (5 - detailLevel) * 5;
    return size;
};

export default StaticLabels;
