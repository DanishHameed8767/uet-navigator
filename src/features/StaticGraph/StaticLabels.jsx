import React from "react";
import { Shape } from "react-konva";
import { latLonToPixel } from "../../utils/mapHelper.js";

const StaticLabels = React.memo(
    ({ nodes, nodeLookup, edges, detailLevel }) => {
        return <Shape />;
    },
    (prev, next) =>
        prev.nodes === next.nodes && prev.detailLevel === next.detailLevel
);

export default StaticLabels;
