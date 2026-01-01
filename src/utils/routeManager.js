import MinHeap from "../data-structures/MinHeap";

//algorithm
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
            // CONSTRAINT 1: Strict Street Avoidance
            // If we are calculating the "No Street" path, strictly skip streets
            if (!useStreets && edge.type === "street") continue;

            // CONSTRAINT 2: Dynamic Penalties via Map
            let weight = edge.weight;
            if (penaltyMap && penaltyMap.has(edge.id)) {
                weight = weight * penaltyMap.get(edge.id);
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

//helper
const hasStreetUsage = (graph, edgeIds) => {
    for (const id of edgeIds) {
        // graph.edges is a Map, so O(1) lookup
        const edge = graph.edges.get(id); 
        if (edge && edge.type === "street") {
            return true;
        }
    }
    return false;
};

//driver
export default calculateRoute = (graph, stops) => {
    if (!stops || stops.length < 2) return null;

    // A. FIND PRIMARY PATH (Fastest, allowed to use streets)
    const primary = getFullItinerary(graph, stops, true, new Map());

    if (!primary) {
        return { shortest: null, alternative: null, noStreet: null };
    }

    // B. FIND ALTERNATIVE PATH (Penalize Primary Edges)
    const penaltyMap = new Map();
    const DEFAULT_PENALTY = 5.0; 

    for (const edgeId of primary.edges) {
        penaltyMap.set(edgeId, DEFAULT_PENALTY);
    }
    
    // We still allow streets in alternative, just looking for a different route
    const alternative = getFullItinerary(graph, stops, true, penaltyMap);

    // C. CONDITIONAL "NO STREET" PATH
    // Only calculate this if Primary or Alternative actually utilized a street.
    let noStreetResult = null;
    
    const primaryUsesStreet = hasStreetUsage(graph, primary.edges);

    if (primaryUsesStreet) {
        // Run strictly with useStreets = false
        noStreetResult = getFullItinerary(graph, stops, false, new Map());
    }

    return {
        shortest: primary.path,
        alternative: alternative ? alternative.path : null,
        // If this is null, it means the primary route already avoided streets (or was identical)
        noStreet: noStreetResult ? noStreetResult.path : null 
    };
};