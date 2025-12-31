export function addNode(prev, node) {
    return {
        ...prev,
        nodes: {
            ...prev.nodes,
            [node.id]: node,
        },
    };
}

export function updateNode(prev, id, patch) {
    if (!prev.nodes[id]) return prev;

    return {
        ...prev,
        nodes: {
            ...prev.nodes,
            [id]: {
                ...prev.nodes[id],
                ...patch,
            },
        },
    };
}

export function deleteNode(prev, nodeId) {
    if (!prev.nodes[nodeId]) return prev;

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

export function addEdge(prev, edge) {
    return {
        ...prev,
        edges: {
            ...prev.edges,
            [edge.id]: edge,
        },
    };
}

export function updateEdge(prev, edgeId, patch) {
    if (!prev.edges[edgeId]) return prev;

    return {
        ...prev,
        edges: {
            ...prev.edges,
            [edgeId]: {
                ...prev.edges[edgeId],
                ...patch,
            },
        },
    };
}

export function deleteEdge(prev, edgeId) {
    if (!prev.edges[edgeId]) return prev;

    const nextEdges = { ...prev.edges };
    delete nextEdges[edgeId];

    return {
        ...prev,
        edges: nextEdges,
    };
}
