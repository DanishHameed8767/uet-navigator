import MinHeap from "../data-structures/minHeap";

/**
 * Standard Dijkstra Implementation (A -> B)
 *
 * @param {Graph} graph - The graph instance containing nodes and edges.
 * @param {string} startId - The ID of the starting node.
 * @param {string} endId - The ID of the destination node.
 * @param {Object} options - Configuration for the pathfinding.
 * @param {boolean} [options.useStreets=true] - If false, skips edges of type 'street'.
 * @param {Map} [options.penaltyMap=null] - A Map<edgeId, multiplier> to increase cost of specific edges.
 *
 * @returns {Object|null} - Returns path object or null if no path found.
 * {
 * path: string[],      // Array of Node IDs: ['nodeA', 'nodeB', ...]
 * edges: string[],     // Array of Edge IDs: ['edge1', 'edge2', ...]
 * distance: number,    // Total physical distance in meters
 * weight: number       // Total cost (time/effort) used for calculation
 * }
 */

export const calcPathWithDijkstra = (
    graph,
    startId,
    endId,
    { useStreets = true, penaltyMap = null } = {}
) => {
    // 1. Validation
    if (!graph.getNode(startId) || !graph.getNode(endId)) {
        console.warn(`Dijkstra: Invalid start (${startId}) or end (${endId})`);
        return null;
    }

    // 2. Initialization
    const distances = new Map(); // Stores lowest Weight (Cost) to reach node
    const previous = new Map(); // Stores predecessor info for path reconstruction
    const pq = new MinHeap(); // Priority Queue based on Weight
    const visited = new Set();

    // Start Node Setup
    distances.set(startId, 0);
    pq.push({ id: startId, f: 0 }); // 'f' is the priority key (accumulated weight)

    // 3. Main Loop
    while (!pq.isEmpty()) {
        const { id: u } = pq.pop();

        // Optimization: Stop if we reached the target
        if (u === endId) {
            return reconstructPath(previous, endId, distances.get(endId));
        }

        // Optimization: Skip stale entries
        if (visited.has(u)) continue;
        visited.add(u);

        // Get Neighbors
        const neighbors = graph.getNeighbors(u);

        for (const edge of neighbors) {
            // CONSTRAINT: Street Avoidance (Pedestrian Mode)
            if (!useStreets && edge.type === "street") {
                continue;
            }

            // COST CALCULATION: Base Weight + Dynamic Penalties
            let weight = edge.weight;
            if (penaltyMap && penaltyMap.has(edge.id)) {
                weight *= penaltyMap.get(edge.id);
            }

            // Resolution of 'v' (The neighbor node)
            const v = edge.from === u ? edge.to : edge.from;

            if (visited.has(v)) continue;

            const currentWeight = distances.get(u) || 0;
            const newWeight = currentWeight + weight;
            const knownWeight = distances.has(v) ? distances.get(v) : Infinity;

            if (newWeight < knownWeight) {
                // Track accumulated physical distance separately for the final report
                // (Weight is for the algorithm, Distance is for the user)
                const prevDist = previous.get(u)?.realDist || 0;
                const newRealDist = prevDist + edge.dist;

                distances.set(v, newWeight);
                previous.set(v, {
                    from: u,
                    edgeId: edge.id,
                    realDist: newRealDist,
                });
                pq.push({ id: v, f: newWeight });
            }
        }
    }

    // 4. No Path Found
    return null;
};

/**
 * Helper: Backtracks from End -> Start to build the path array.
 */
const reconstructPath = (previous, endId, totalWeight) => {
    const path = [endId];
    const edgeIds = [];
    let curr = endId;
    let totalRealDistance = 0;

    // Retrieve the final physical distance recorded at the end node
    if (previous.has(endId)) {
        totalRealDistance = previous.get(endId).realDist;
    }

    while (previous.has(curr)) {
        const info = previous.get(curr);
        path.unshift(info.from); // Add node to front
        edgeIds.unshift(info.edgeId); // Add edge to front
        curr = info.from;
    }

    return {
        path: path, // ['A', 'B', 'C']
        edges: edgeIds, // ['e1', 'e2']
        distance: totalRealDistance, // Meters
        weight: totalWeight, // Cost
    };
};
