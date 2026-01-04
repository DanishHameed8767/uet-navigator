import { calcPathWithAStar } from "./algoAStar.js";
import { calcPathWithDijkstra } from "./algoDijkstra.js";
import {
    calcEstimatedTime,
    getDistance,
    imageToGridXY,
    pixelToLatLon,
} from "../utils/mapHelper.js";
import { getTempGraph } from "../data-structures/graph/GraphHydrator";

/**
 * ROUTE MANAGER
 * -------------
 * The sole orchestrator for navigation logic.
 *
 * Responsibilities:
 * 1. Decide Strategy: A* (Walk) vs Dijkstra (Drive/Bike).
 * 2. Manage Multi-Stop: Loop through stops and stitch paths.
 * 3. Translate Coordinates: Pixels <-> Grid/Graph.
 * 4. Generate Variations: Primary, Alternative, No-Street.
 */

export const getRoute = ({
    stops,
    travelMode,
    graph,
    walkMatrix,
    gridConfig,
    nodeLookup,
    useStreets = true,
}) => {
    if (!stops || stops.length < 2) {
        return null;
    }
    const isWalk = travelMode === "walk";
    if (isWalk) {
        return handleWalkRoute(stops, walkMatrix, gridConfig);
    } else {
        return handleGraphRoute(
            stops,
            graph,
            nodeLookup,
            travelMode,
            useStreets
        );
    }
};

// ===========================================================================
// MODE 1: WALK (A*)
// ===========================================================================

const handleWalkRoute = (stops, matrix, gridConfig) => {
    if (!matrix || !gridConfig) {
        return null;
    }

    let fullPixelPoints = [];
    let totalDistance = 0;

    const p1 = pixelToLatLon(0, 0);
    const p2 = pixelToLatLon(100, 0);
    const metersIn100Px = getDistance(p1.lat, p1.lon, p2.lat, p2.lon);
    const metersPerPixel = metersIn100Px / 100;

    for (let i = 0; i < stops.length - 1; i++) {
        // A. Translate Input: Pixel -> Grid
        const start = imageToGridXY(
            stops[i].click?.x,
            stops[i].click?.y,
            gridConfig
        );
        const end = imageToGridXY(
            stops[i + 1].click?.x,
            stops[i + 1].click?.y,
            gridConfig
        );

        // B. Call Algorithm
        const result = calcPathWithAStar(matrix, start, end);

        if (!result) {
            console.warn(`A* failed between stop ${i} and ${i + 1}`);
            return null; // Path blocked
        }

        // C. Translate Output: Grid -> Pixel
        const segmentPixels = result.path.flatMap((node) => {
            const px =
                node.col * gridConfig.cellWidth + gridConfig.cellWidth / 2;
            const py =
                node.row * gridConfig.cellHeight + gridConfig.cellHeight / 2;
            return [px, py];
        });

        // Accumulate
        fullPixelPoints.push(...segmentPixels);
        const segmentPixelsLen = result.distance * gridConfig.cellWidth;
        totalDistance += segmentPixelsLen * metersPerPixel;
    }

    const estimatedTime = totalDistance / 80;

    return {
        shortest: {
            path: fullPixelPoints, // [x1, y1, x2, y2...]
            dist: totalDistance,
            time: Math.ceil(estimatedTime),
        },
        alternative: null,
        noStreet: null,
    };
};

// ===========================================================================
// STRATEGY 2: DRIVE (Dijkstra)
// ===========================================================================

const handleGraphRoute = (stops, graph, nodeLookup, travelMode, useStreets) => {
    if (!graph || !nodeLookup) {
        return null;
    }

    const sessionGraph = getTempGraph(graph, stops);

    // A. Primary Path (Fastest)
    const primary = runMultiStopDijkstra(
        stops,
        sessionGraph,
        nodeLookup,
        travelMode,
        {
            useStreets: useStreets,
            penaltyMap: null,
        }
    );

    if (!primary) {
        return null;
    }

    // B. Alternative Path (Penalize Primary Edges)
    const penaltyMap = new Map();
    primary.edgeIds.forEach((id) => penaltyMap.set(id, 5.0));

    const alternative = runMultiStopDijkstra(
        stops,
        sessionGraph,
        nodeLookup,
        travelMode,
        {
            useStreets: useStreets,
            penaltyMap,
        }
    );

    // C. No-Street Path
    let noStreet = null;
    if (
        hasStreetUsage(sessionGraph, primary.edgeIds) &&
        hasStreetUsage(sessionGraph, alternative.edgeIds)
    ) {
        noStreet = runMultiStopDijkstra(
            stops,
            sessionGraph,
            nodeLookup,
            travelMode,
            {
                useStreets: false,
                penaltyMap: null,
            }
        );
    }

    return {
        shortest: formatResult(primary),
        alternative: formatResult(alternative),
        noStreet: formatResult(noStreet),
    };
};

const runMultiStopDijkstra = (
    stops,
    graph,
    nodeLookup,
    travelMode,
    options
) => {
    let fullPathIds = [];
    let fullEdgeIds = [];
    let totalDist = 0;

    let lastArrivalEdgeId = null;
    let isDriveCar = travelMode === "car";

    for (let i = 0; i < stops.length - 1; i++) {
        const startId = resolveNodeId(stops[i], i);
        const endId = resolveNodeId(stops[i + 1], i + 1);

        const currentPenaltyMap = new Map(options.penaltyMap || []);
        if (isDriveCar && lastArrivalEdgeId) {
            currentPenaltyMap.set(lastArrivalEdgeId, 10000);
        }
        const result = calcPathWithDijkstra(graph, startId, endId, {
            ...options,
            penaltyMap: currentPenaltyMap,
        });
        if (!result) {
            return null;
        }
        if (isDriveCar && result.edges.length > 0) {
            lastArrivalEdgeId = result.edges[result.edges.length - 1];
        }

        const segmentPath = i === 0 ? result.path : result.path.slice(1);
        fullPathIds.push(...segmentPath);
        fullEdgeIds.push(...result.edges);
        totalDist += result.distance;
    }

    const pixelPoints = fullPathIds.flatMap((id) => {
        const node = nodeLookup[id];
        if (node) {
            return [node.x, node.y];
        }
        if (id.startsWith("temp_")) {
            const index = parseInt(id.split("_")[1], 10);
            if (!isNaN(index) && stops[index]) {
                return [stops[index].snap.node.x, stops[index].snap.node.y];
            }
        }
        return [];
    });

    const totalTime = calcEstimatedTime(graph, fullEdgeIds);

    return {
        pixels: pixelPoints,
        dist: totalDist,
        time: Math.ceil(totalTime),
        edgeIds: fullEdgeIds,
    };
};

// ===========================================================================
// UTILITIES
// ===========================================================================

const formatResult = (raw) => {
    if (raw) {
        return {
            path: raw.pixels, // [x1, y1, x2, y2...]
            dist: raw.dist,
            time: raw.time,
        };
    }
    return null;
};

const resolveNodeId = (stop, index) => {
    if (stop.snap?.type === "temporary") {
        return `temp_${index}`;
    }
    return stop.snap?.node?.id;
};

const hasStreetUsage = (graph, edgeIds) => {
    for (const id of edgeIds) {
        const edge = graph.edges.get(id);
        if (edge?.type === "street") {
            return true;
        }
    }
    return false;
};
