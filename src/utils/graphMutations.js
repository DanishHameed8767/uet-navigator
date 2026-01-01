function formatNode(node) {
    return {
        ...node,
        lat: Number(node.lat),
        lon: Number(node.lon),
        tier: Number(node.tier),
    };
}

export function addNode(prev, node) {
    return {
        ...prev,
        nodes: {
            ...prev.nodes,
            [node.id]: formatNode(node),
        },
    };
}

export function updateNode(prev, id, patch) {
    if (prev.nodes[id]) {
        return {
            ...prev,
            nodes: {
                ...prev.nodes,
                [id]: {
                    ...prev.nodes[id],
                    ...formatNode(patch),
                },
            },
        };
    }

    return prev;
}

export function deleteNode(prev, nodeId) {
    if (prev.nodes[nodeId]) {
        const nextNodes = { ...prev.nodes };
        delete nextNodes[nodeId];
        const nextEdges = {};
        for (const [edgeId, edge] of Object.entries(prev.edges)) {
            if (edge.from !== nodeId && edge.to !== nodeId) {
                nextEdges[edgeId] = edge;
            }
        }
        return {
            ...prev,
            nodes: nextNodes,
            edges: nextEdges,
        };
    }
    return prev;
}

export function isValidNode(node) {
    return !(
        node.type === "" ||
        node.tier === "" ||
        node.lat === "" ||
        node.lon === ""
    );
}

function formatEdge(edge) {
    return {
        ...edge,
        from: Number(edge.from),
        to: Number(edge.to),
        dist: Number(edge.dist),
        twoWay: Boolean(edge.twoWay),
    };
}

export function addEdge(prev, edge) {
    return {
        ...prev,
        edges: {
            ...prev.edges,
            [edge.id]: formatEdge(edge),
        },
    };
}

export function updateEdge(prev, edgeId, patch) {
    if (prev.edges[edgeId]) {
        return {
            ...prev,
            edges: {
                ...prev.edges,
                [edgeId]: {
                    ...prev.edges[edgeId],
                    ...formatEdge(patch),
                },
            },
        };
    }
    return prev;
}

export function deleteEdge(prev, edgeId) {
    if (prev.edges[edgeId]) {
        const nextEdges = { ...prev.edges };
        delete nextEdges[edgeId];
        return {
            ...prev,
            edges: nextEdges,
        };
    }
    return prev;
}

export function isValidEdge(edge) {
    return !(
        edge.type === "" ||
        edge.to === "" ||
        edge.from === "" ||
        edge.dist === ""
    );
}
