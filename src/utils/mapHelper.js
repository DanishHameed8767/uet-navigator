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
    MAX_STOPS: 4,
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
    if (type === "dept") return 1;
    if (type === "worship") return 1;
    if (type === "cafe") return 2;
    if (type === "hostel") return 2;
    if (type === "ground") return 2;
    if (type === "service") return 2;
    if (type === "wall") return 3;
    if (type === "intersection") return 3;
    if (type === "other") return 3;
    return 3;
};

// nodes = renderNodes [{ id, x, y, ... }]
export const createNodeLookup = (nodes) => {
    const lookup = Object.create(null);
    for (const node of nodes) {
        lookup[node.id] = node;
    }
    return lookup;
};

// Zaheer's Impl:

// export const findClosestNode = (x, y, nodes, threshold = 15) => {
//     let closest = null;
//     let minSq = threshold * threshold;
//     for (const node of nodes) {
//         const { x: nx, y: ny } = latLonToPixel(node.lat, node.lon);
//         const distSq = (x - nx) ** 2 + (y - ny) ** 2;
//         if (distSq < minSq) {
//             minSq = distSq;
//             closest = node;
//         }
//     }
//     return closest;
// };

// Danish's Impl:

// nodes = renderNodes (already have x, y)
export const findClosestNode = (x, y, nodes, threshold = 15) => {
    let closest = null;
    let minSq = threshold * threshold;

    for (const node of nodes) {
        const dx = x - node.x;
        const dy = y - node.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < minSq) {
            minSq = distSq;
            closest = node;
        }
    }

    return closest;
};

// Zaheer's Impl:

// export const findClosestEdge = (x, y, edges, nodeLookup, threshold = 10) => {
//     let closestIndex = -1;
//     let minSq = threshold * threshold;
//     for (let i = 0; i < edges.length; i++) {
//         const edge = edges[i];
//         const nA = nodeLookup[edge.from];
//         const nB = nodeLookup[edge.to];
//         if (!nA || !nB) continue;
//         const pA = latLonToPixel(nA.lat, nA.lon);
//         const pB = latLonToPixel(nB.lat, nB.lon);
//         const distSq = getDistToSegmentSquared(x, y, pA.x, pA.y, pB.x, pB.y);
//         if (distSq < minSq) {
//             minSq = distSq;
//             closestIndex = i;
//         }
//     }
//     return closestIndex;
// };

// Danish's Impl:

export const findClosestEdge = (x, y, edges, nodeLookup, threshold = 10) => {
    let closestIndex = -1;
    let minSq = threshold * threshold;

    for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const nA = nodeLookup[edge.from];
        const nB = nodeLookup[edge.to];
        if (!nA || !nB) continue;

        const distSq = getDistToSegmentSquared(x, y, nA.x, nA.y, nB.x, nB.y);

        if (distSq < minSq) {
            minSq = distSq;
            closestIndex = i;
        }
    }

    return closestIndex;
};

function getDistToSegmentSquared(px, py, x1, y1, x2, y2) {
    const l2 = (x1 - x2) ** 2 + (y1 - y2) ** 2;
    if (l2 === 0) return (px - x1) ** 2 + (py - y1) ** 2;
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return (px - (x1 + t * (x2 - x1))) ** 2 + (py - (y1 + t * (y2 - y1))) ** 2;
}
