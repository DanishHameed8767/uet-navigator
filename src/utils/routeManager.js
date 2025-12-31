import MinHeap from '../data-structures/minHeap.js'

/**
 * ============================================================
 * 1. HELPER: WEIGHT CALCULATOR
 * ============================================================
 * dynamic weighting based on travel mode.
 */
const getEffectiveWeight = (edge, travelMode) => {
    // If we are in a car, we hate 'streets'. We prefer 'roads'.
    // We multiply the weight by 100 to make it a "last resort" 
    // (only used if no other way exists).
    if (travelMode === "car" && edge.type === "street") {
        return edge.weight * 50; 
    }
    
    // Bike prefers streets? Maybe. For now, treat normally.
    return edge.weight;
};

/**
 * ============================================================
 * 2. ENGINE: CORE DIJKSTRA
 * ============================================================
 * The low-level algorithm that finds the best path between TWO points.
 */
const coreDijkstra = (graph, startId, endId, { travelMode = "bike", excludedEdgeId = null } = {}) => {
    const distances = new Map();
    const previous = new Map(); // Stores { nodeId: { fromNodeId, edgeId } }
    const visited = new Set();
    const pq = new MinHeap(); // Using your MinHeap class

    // Initialize
    distances.set(startId, 0);
    pq.push({ id: startId, f: 0 }); // 'f' is used for priority

    while (!pq.isEmpty()) {
        const { id: u } = pq.pop();

        if (u === endId) break; // Reached target
        if (visited.has(u)) continue;
        visited.add(u);

        // Get Neighbors
        const edges = graph.getNeighbors(u);

        for (const edge of edges) {
            // 1. CONSTRAINT: Exclude specific edge (for Alternative Path)
            if (edge.id === excludedEdgeId) continue;

            // 2. CONSTRAINT: Determine neighbor node
            const v = edge.from === u ? edge.to : edge.from;
            if (visited.has(v)) continue;

            // 3. CONSTRAINT: Mode-Specific Weight
            const weight = getEffectiveWeight(edge, travelMode);
            
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

/**
 * Reconstructs the path from the 'previous' map.
 */
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

/**
 * ============================================================
 * 3. DRIVER: MULTI-STOP ROUTE MANAGER
 * ============================================================
 * The main function you call from UI. 
 * Handles: Stops, Car/Bike constraints, and Alternative Paths.
 * * @param {Graph} graph - Your graph instance
 * @param {string[]} stopIds - Array of Node IDs: ['Start', 'Stop1', 'Stop2', 'End']
 * @param {string} travelMode - 'car' or 'bike'
 */
export const calculateRoute = (graph, stopIds, travelMode = "bike") => {
    if (!stopIds || stopIds.length < 2) return null;

    let fullPrimaryPath = [];
    let fullAlternativePath = [];
    
    // We process the route in segments (Start -> Stop1, Stop1 -> Stop2, etc.)
    for (let i = 0; i < stopIds.length - 1; i++) {
        const start = stopIds[i];
        const end = stopIds[i + 1];

        // A. FIND PRIMARY PATH FOR SEGMENT
        const primary = coreDijkstra(graph, start, end, { travelMode });
        
        if (!primary) {
            console.warn(`No path found between ${start} and ${end}`);
            return null; // Route is impossible
        }

        // B. FIND ALTERNATIVE PATH FOR SEGMENT
        // Strategy: Try to break each edge in the primary path and see if we find a decent detour.
        let bestAlt = null;
        
        // Optimization: Don't try to break every single edge if path is huge. 
        // Just checking the first few and last few often gives good results.
        const edgesToCheck = primary.edges; 

        for (const edgeId of edgesToCheck) {
            const candidate = coreDijkstra(graph, start, end, { 
                travelMode, 
                excludedEdgeId: edgeId 
            });

            if (candidate) {
                // valid candidate?
                // We want the alternative to be valid, but maybe not TOO much longer (e.g., < 2x distance)
                // But simplified: just take the best (shortest) valid deviation found.
                if (!bestAlt || candidate.distance < bestAlt.distance) {
                    bestAlt = candidate;
                }
            }
        }

        // Use the found alternative, or fallback to primary if no alternative exists (dead end road)
        const segmentAlt = bestAlt || primary;

        // C. CONCATENATE TO MASTER LISTS
        // Note: We slice(1) to avoid duplicating the join node (A->B, B->C becomes A,B,B,C without slice)
        if (i === 0) {
            fullPrimaryPath = primary.path;
            fullAlternativePath = segmentAlt.path;
        } else {
            fullPrimaryPath = [...fullPrimaryPath, ...primary.path.slice(1)];
            fullAlternativePath = [...fullAlternativePath, ...segmentAlt.path.slice(1)];
        }
    }

    return {
        shortest: fullPrimaryPath,    // Array of NodeIDs
        alternative: fullAlternativePath // Array of NodeIDs
    };
};