import MinHeap from "../data-structures/MinHeap";

const coreDijkstra = (graph, startId, endId, useStreets, penaltyMap) => {
    const distances = new Map();
    const previous = new Map();
    const visited = new Set();
    const pq = new MinHeap();

    distances.set(startId, 0);
    pq.push({ id: startId, f: 0 });

    while (!pq.isEmpty()) {
        const { id: u } = pq.pop();

        if (u === endId) break;
        if (visited.has(u)) continue;
        visited.add(u);

        const edges = graph.getNeighbors(u);

        for (const edge of edges) {
            if (!useStreets && edge.type === "street") continue;

            let weight = edge.weight;

            if (penaltyMap && penaltyMap.has(edge.id)) {
                const multiplier = penaltyMap.get(edge.id);
                weight = weight * multiplier;
            }

            const v = edge.from === u ? edge.to : edge.from;
            if (visited.has(v)) continue;

            const newDist = (distances.get(u) || Infinity) + weight;
            const currentDist = distances.get(v) === undefined ? Infinity : distances.get(v);

            if (newDist < currentDist) {
                distances.set(v, newDist);
                previous.set(v, { fromNode: u, edgeId: edge.id });
                pq.push({ id: v, f: newDist });
            }
        }
    }

    return reconstructPath(previous, endId, distances.get(endId));
};

//helper
const reconstructPath = (previous, endId, totalDistance) => {
    if (totalDistance === Infinity || totalDistance === undefined) return null;

    const path = [endId];
    const edgeIds = [];
    let curr = endId;

    while (previous.has(curr)) {
        const info = previous.get(curr);
        path.unshift(info.fromNode);
        edgeIds.unshift(info.edgeId);
        curr = info.fromNode;
    }

    return { path, edges: edgeIds, distance: totalDistance };
};


//helper
const getFullItinerary = (graph, stops, useStreets, penaltyMap) => {
    let fullPath = [];
    let allEdges = [];
    let totalDist = 0;

    for (let i = 0; i < stops.length - 1; i++) {
        const start = stops[i];
        const end = stops[i + 1];

        // Pass the Map down to the engine
        const segmentResult = coreDijkstra(graph, start, end, useStreets, penaltyMap);

        if (!segmentResult) return null;

        if (i === 0) {
            fullPath = segmentResult.path;
            allEdges = segmentResult.edges;
        } else {
            fullPath = [...fullPath, ...segmentResult.path.slice(1)];
            allEdges = [...allEdges, ...segmentResult.edges];
        }
        totalDist += segmentResult.distance;
    }

    return { path: fullPath, edges: allEdges, distance: totalDist };
};


//driver
export default calculateRoute = (graph, stops, useStreets = true) => {
    if (!stops || stops.length < 2) return null;

    // A. FIND PRIMARY PATH (Pass empty Map)
    const primary = getFullItinerary(graph, stops, useStreets, new Map());

    if (!primary) {
        return { shortest: null, alternative: null };
    }

    // B. FIND ALTERNATIVE PATH
    const penaltyMap = new Map();
    const DEFAULT_PENALTY = 1.5;

    for (const edgeId of primary.edges) {
        penaltyMap.set(edgeId, DEFAULT_PENALTY);
    }

    const alternative = getFullItinerary(graph, stops, useStreets, penaltyMap);

    return {
        shortest: primary.path,
        alternative: alternative ? alternative.path : null
    };
};