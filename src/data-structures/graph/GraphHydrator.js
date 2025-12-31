import Graph from "./classes/Graph";
import GraphNode from "./classes/GraphNode";
import GraphEdge from "./classes/GraphEdge";
import { latLonToPixel } from "../../utils/mapHelper";

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
        if (!graph.getNode(raw.from) || !graph.getNode(raw.to)) continue;

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
        if (!a || !b) continue;

        renderEdges.push({
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
