import Graph from "./classes/Graph";
import GraphNode from "./classes/GraphNode";
import GraphEdge from "./classes/GraphEdge";
import { getDistance, latLonToPixel } from "../../utils/mapHelper";

export function hydrateGraph(graphData) {
    if (!graphData?.nodes || !graphData?.edges) {
        return {
            graph: null,
            render: { nodes: [], edges: [] },
            indexes: {},
        };
    }

    const graph = new Graph();

    // ---------- Nodes ----------
    const renderNodes = [];
    const nodePositions = new Map(); // id -> { x, y }

    for (const raw of Object.values(graphData.nodes)) {
        const node = new GraphNode({
            id: raw.id,
            lat: raw.lat,
            lon: raw.lon,
            type: raw.type,
            tier: raw.tier,
            name: raw.name,
        });

        graph.addNode(node);

        const { x, y } = latLonToPixel(raw.lat, raw.lon);
        nodePositions.set(raw.id, { x, y });

        renderNodes.push({
            id: raw.id,
            x,
            y,
            type: raw.type,
            tier: raw.tier,
            name: raw.name,
        });
    }

    // ---------- Edges ----------
    const renderEdges = [];

    for (const raw of Object.values(graphData.edges)) {
        if (!graph.getNode(raw.from) || !graph.getNode(raw.to)) {
            continue;
        }

        const edge = new GraphEdge({
            id: raw.id,
            from: raw.from,
            to: raw.to,
            dist: raw.dist,
            type: raw.type,
            twoWay: raw.twoWay,
            name: raw.name,
        });

        graph.addEdge(edge);

        const a = nodePositions.get(raw.from);
        const b = nodePositions.get(raw.to);
        if (!a || !b) {
            continue;
        }

        renderEdges.push({
            name: raw.name,
            id: raw.id,
            from: raw.from,
            to: raw.to,
            type: raw.type,
            dist: raw.dist,
            twoWay: raw.twoWay,
            points: [a.x, a.y, b.x, b.y],
        });
    }

    // ---------- Indexes ----------
    const indexes = {
        byType: new Map(),
        byTier: new Map(),
        byName: new Map(),
    };

    for (const node of graph.nodes.values()) {
        // byType
        if (!indexes.byType.has(node.type)) {
            indexes.byType.set(node.type, []);
        }
        indexes.byType.get(node.type).push(node.id);

        // byTier
        if (!indexes.byTier.has(node.tier)) {
            indexes.byTier.set(node.tier, []);
        }
        indexes.byTier.get(node.tier).push(node.id);

        // byName
        const key = node.name?.trim().toLowerCase();
        if (key && !indexes.byName.has(key)) {
            indexes.byName.set(key, node.id);
        }
    }

    return {
        graph,
        render: {
            nodes: renderNodes,
            edges: renderEdges,
        },
        indexes,
    };
}

export function getTempGraph(graph, tempEntities) {
    const tempGraph = new Graph();
    tempGraph.nodes = new Map(graph.nodes);
    tempGraph.edges = new Map(graph.edges);
    tempGraph.adjacency = new Map(graph.adjacency);

    tempEntities.forEach((stop, index) => {
        if (!stop.snap || stop.snap?.type !== "temporary") {
            return;
        }
        const entity = stop.snap;

        const tempNodeId = `temp_${index}`;
        const tempNode = new GraphNode({
            id: tempNodeId,
            lat: entity.node.lat,
            lon: entity.node.lon,
            type: "temporary",
            tier: 3,
            name: "Temporary Stop",
        });

        tempGraph.nodes.set(tempNodeId, tempNode);

        const originalEdge = entity.edge;
        const nodeA = graph.nodes.get(originalEdge.from);
        const nodeB = graph.nodes.get(originalEdge.to);

        const distA = getDistance(
            nodeA.lat,
            nodeA.lon,
            tempNode.lat,
            tempNode.lon
        );
        const distB = getDistance(
            nodeB.lat,
            nodeB.lon,
            tempNode.lat,
            tempNode.lon
        );

        const edge1 = new GraphEdge({
            id: `${originalEdge.id}_p1`,
            from: nodeA.id,
            to: tempNodeId,
            dist: distA,
            type: originalEdge.type,
            twoWay: originalEdge.twoWay,
        });

        const edge2 = new GraphEdge({
            id: `${originalEdge.id}_p2`,
            from: tempNodeId,
            to: nodeB.id,
            dist: distB,
            type: originalEdge.type,
            twoWay: originalEdge.twoWay,
        });

        const adjA = tempGraph.adjacency.get(nodeA.id) || [];
        tempGraph.adjacency.set(nodeA.id, [...adjA, edge1]);

        const adjB = tempGraph.adjacency.get(nodeB.id) || [];
        tempGraph.adjacency.set(nodeB.id, [...adjB, edge2]);

        tempGraph.adjacency.set(tempNodeId, [edge1, edge2]);

        tempGraph.edges.set(edge1.id, edge1);
        tempGraph.edges.set(edge2.id, edge2);
    });

    return tempGraph;
}
