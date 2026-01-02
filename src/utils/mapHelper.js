export const MAP_CONFIG = {
    p1: {
        x: 0,
        y: 239,
        lat: 31.583596822979406,
        lon: 74.35017532965013,
    },
    p2: {
        x: 6780,
        y: 3681,
        lat: 31.578362660382176,
        lon: 74.36228327374383,
    },
    MAX_STOPS: 10,
};

const getScales = () => {
    const { p1, p2 } = MAP_CONFIG;
    const latScale = (p2.lat - p1.lat) / (p2.y - p1.y);
    const lonScale = (p2.lon - p1.lon) / (p2.x - p1.x);
    return { latScale, lonScale };
};

export const pixelToLatLon = (x, y) => {
    const { p1 } = MAP_CONFIG;
    const { latScale, lonScale } = getScales();

    const lat = p1.lat + (y - p1.y) * latScale;
    const lon = p1.lon + (x - p1.x) * lonScale;

    return { lat, lon };
};

export const latLonToPixel = (lat, lon) => {
    const { p1 } = MAP_CONFIG;
    const { latScale, lonScale } = getScales();

    const x = p1.x + (lon - p1.lon) / lonScale;
    const y = p1.y + (lat - p1.lat) / latScale;

    return { x, y };
};

export const getDistance = (lat1, lon1, lat2, lon2) => {
    // Haversine Distance Formula
    const R = 6371e3;
    const phi1 = lat1 * (Math.PI / 180);
    const phi2 = lat2 * (Math.PI / 180);
    const deltaPhi = (lat2 - lat1) * (Math.PI / 180);
    const deltaLambda = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) *
            Math.cos(phi2) *
            Math.sin(deltaLambda / 2) *
            Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 100) / 100;
};

export const getNodeTier = (type) => {
    if (["dept", "worship"].includes(type)) {
        return 1;
    }
    if (["cafe", "hostel", "ground", "service"].includes(type)) {
        return 2;
    }
    if (["wall", "intersection", "other"].includes(type)) {
        return 3;
    }
    return 3;
};

export const findClosestNode = (x, y, nodes, threshold = 15) => {
    let minSq = threshold * threshold;
    let target = null;
    for (const node of nodes) {
        const nx = node.x ?? latLonToPixel(node.lat, node.lon).x;
        const ny = node.y ?? latLonToPixel(node.lat, node.lon).y;
        const distSq = (x - nx) ** 2 + (y - ny) ** 2;
        if (distSq < minSq) {
            minSq = distSq;
            target = node;
        }
    }
    return target;
};

export const findClosestEdge = (
    x,
    y,
    edges,
    nodeLookup,
    threshold = 10,
    findMovable = false
) => {
    let minSq = threshold * threshold;
    let target = null;
    for (const edge of edges) {
        if (findMovable && edge.type === "wall") {
            continue;
        }
        const nA = nodeLookup[edge.from];
        const nB = nodeLookup[edge.to];
        if (!nA || !nB) {
            continue;
        }
        const pA = nA.x ? nA : latLonToPixel(nA.lat, nA.lon);
        const pB = nB.x ? nB : latLonToPixel(nB.lat, nB.lon);
        const distSq = getDistToSegmentSquared(x, y, pA.x, pA.y, pB.x, pB.y);
        if (distSq < minSq) {
            minSq = distSq;
            target = edge;
        }
    }
    return target;
};

export const snapToEntity = (
    x,
    y,
    nodes,
    edges,
    nodeLookup,
    graph,
    threshold = 15
) => {
    const closestNode = findClosestNode(x, y, nodes, Infinity);
    let nodeDist = Infinity;
    if (closestNode) {
        const p = closestNode.x
            ? closestNode
            : latLonToPixel(closestNode.lat, closestNode.lon);
        nodeDist = Math.sqrt((x - p.x) ** 2 + (y - p.y) ** 2);
    }

    const closestEdge = findClosestEdge(
        x,
        y,
        edges,
        nodeLookup,
        Infinity,
        true // Ignore wall edges
    );
    let edgeDist = Infinity;
    let projPoint = null;
    let edgeToDist = 0;
    let edgeFromDist = 0;

    if (closestEdge) {
        const nA = nodeLookup[closestEdge.from];
        const nB = nodeLookup[closestEdge.to];
        if (nA && nB) {
            const pA = nA.x ? nA : latLonToPixel(nA.lat, nA.lon);
            const pB = nB.x ? nB : latLonToPixel(nB.lat, nB.lon);
            projPoint = getProjectedPoint(x, y, pA.x, pA.y, pB.x, pB.y);
            edgeDist = Math.sqrt(
                (x - projPoint.x) ** 2 + (y - projPoint.y) ** 2
            );
            edgeFromDist = Math.sqrt((x - pA.x) ** 2 + (y - pA.y) ** 2);
            edgeToDist = Math.sqrt((x - pB.x) ** 2 + (y - pB.y) ** 2);
        }
    }

    if (closestEdge && (edgeDist < 30 || edgeDist < nodeDist / 2)) {
        if (edgeDist < 30) {
            if (edgeToDist > 200 && edgeFromDist > 200) {
                return {
                    type: "temporary",
                    edge: closestEdge,
                    node: {
                        id: null,
                        name: "",
                        type: "intersection",
                        tier: 3,
                        ...pixelToLatLon(projPoint.x, projPoint.y),
                        x: projPoint.x,
                        y: projPoint.y,
                    },
                };
            } else if (edgeFromDist < edgeToDist) {
                const finalNode = nodeLookup[closestEdge.from];
                return {
                    type: "permanent",
                    node: finalNode,
                };
            } else {
                const finalNode = nodeLookup[closestEdge.to];
                return {
                    type: "permanent",
                    node: finalNode,
                };
            }
        }
    }

    if (closestNode) {
        const finalNode = resolveStopNode(
            closestNode,
            graph.adjacency,
            nodeLookup
        );
        return {
            type: "permanent",
            node: finalNode,
        };
    }
    return null;
};

function resolveStopNode(node, adjacency, nodeLookup) {
    const tier = getNodeTier(node.type);

    // Rule: Tier 3 Intersection -> Stop is self
    if (tier === 3 && node.type === "intersection") {
        return node;
    }

    // Rule: Tier 3 Wall -> Find connected Tier 1/2 -> Then find its Entrance
    if (tier === 3 && node.type === "wall") {
        const mainNode = findNeighbor(
            node.id,
            adjacency,
            nodeLookup,
            (n) => getNodeTier(n.type) < 3
        );
        if (mainNode) {
            return resolveStopNode(mainNode, adjacency, nodeLookup);
        }
        return node;
    }

    // Rule: Tier 1 -> Find connected Tier 2 Entrance (Service)
    if (tier === 1) {
        const entrance = findNeighbor(
            node.id,
            adjacency,
            nodeLookup,
            (n) => n.type === "service"
        );
        return entrance || node;
    }

    // Rule: Tier 2 -> If Entrance (Service), stop self. If not, find connected Entrance.
    if (tier === 2) {
        if (node.type === "service") {
            return node;
        }
        const entrance = findNeighbor(
            node.id,
            adjacency,
            nodeLookup,
            (n) => n.type === "service"
        );
        return entrance || node;
    }

    return node;
}

function findNeighbor(nodeId, adjacency, nodeLookup, predicate) {
    const connectedEdges = adjacency.get(nodeId);
    if (connectedEdges) {
        for (const edge of connectedEdges) {
            const neighborId = edge.from === nodeId ? edge.to : edge.from;
            const neighbor = nodeLookup[neighborId];
            if (neighbor && predicate(neighbor)) {
                return neighbor;
            }
        }
    }
    return null;
}

function getProjectedPoint(px, py, x1, y1, x2, y2) {
    const l2 = (x1 - x2) ** 2 + (y1 - y2) ** 2;
    if (l2 === 0) {
        return { x: x1, y: y1 };
    }

    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));

    return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1),
    };
}

function getDistToSegmentSquared(px, py, x1, y1, x2, y2) {
    const l2 = (x1 - x2) ** 2 + (y1 - y2) ** 2;
    if (l2 === 0) {
        return (px - x1) ** 2 + (py - y1) ** 2;
    }
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return (px - (x1 + t * (x2 - x1))) ** 2 + (py - (y1 + t * (y2 - y1))) ** 2;
}

export const imageToGridXY = (imgX, imgY, gridConfig) => {
    const col = Math.floor(imgX / gridConfig.cellWidth);
    const row = Math.floor(imgY / gridConfig.cellHeight);
    if (
        row < 0 ||
        row >= gridConfig.rows ||
        col < 0 ||
        col >= gridConfig.cols
    ) {
        return { row: 0, col: 0 };
    }
    return { row, col };
};
