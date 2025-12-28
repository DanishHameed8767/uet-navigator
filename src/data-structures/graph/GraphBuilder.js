import Graph from "./classes/Graph";
import GraphNode from "./classes/GraphNode";
import GraphEdge from "./classes/GraphEdge";
import { latLonToPixel } from "../../utils/mapHelper";

const EDGE_SPEED_KMPH = {
  road: 30,
  street: 20,
  wall: Infinity,
};

const computeWeight = (dist, type) => {
  const speed = EDGE_SPEED_KMPH[type] ?? Infinity;
  if (!dist || speed === Infinity) {
    return Infinity;
  }
  return dist / speed;
};

const normalizeName = (s) => (s || "").trim().toLowerCase();

export function buildGraph(nodesJson, edgesJson) {
  if (!Array.isArray(nodesJson)) {
    throw new Error("nodesJson must be an array");
  }
  if (!Array.isArray(edgesJson)) {
    throw new Error("edgesJson must be an array");
  }

  const graph = new Graph();

  for (const raw of nodesJson) {
    if (!raw || typeof raw.id !== "number") {
      continue;
    }

    if (graph.getNode(raw.id)) {
      throw new Error(`Duplicate node id detected: ${raw.id}`);
    }

    const { x, y } = latLonToPixel(raw.lat, raw.lon);

    const node = new GraphNode({
      id: raw.id,
      lat: raw.lat,
      lon: raw.lon,
      x,
      y,
      type: raw.type || "intersection",
      tier: raw.tier ?? 3,
      name: raw.name || "",
    });

    graph.addNode(node);
  }

  const invalidEdges = [];

  const addDirectedEdge = (fromNode, toNode, raw) => {
    const edge = new GraphEdge({
      id: `${fromNode.id}->${toNode.id}::${raw.type}`,
      from: fromNode,
      to: toNode,
      dist: raw.dist,
      weight:
        typeof raw.weight === "number"
          ? raw.weight
          : computeWeight(raw.dist, raw.type),
      type: raw.type,
      name: raw.name || "",
    });

    graph.addEdge(edge);
  };

  for (const raw of edgesJson) {
    const { from, to, twoWay = false } = raw;

    const fromNode = graph.getNode(from);
    const toNode = graph.getNode(to);

    if (!fromNode || !toNode) {
      invalidEdges.push(raw);
      continue;
    }

    addDirectedEdge(fromNode, toNode, raw);

    if (twoWay === true) {
      addDirectedEdge(toNode, fromNode, raw);
    }
  }

  const renderNodes = [];
  const renderEdges = [];

  for (const node of graph.nodes.values()) {
    renderNodes.push({
      id: node.id,
      x: node.x,
      y: node.y,
      type: node.type,
      tier: node.tier,
      name: node.name,
    });
  }

  for (const raw of edgesJson) {
    const a = graph.getNode(raw.from);
    const b = graph.getNode(raw.to);
    if (!a || !b) {
      continue;
    }

    renderEdges.push({
      id: `${raw.from}-${raw.to}`,
      from: raw.from,
      to: raw.to,
      type: raw.type,
      dist: raw.dist,
      twoWay: raw.twoWay === true,
      points: [a.x, a.y, b.x, b.y],
    });
  }

  const indexes = {
    byType: new Map(),
    byTier: new Map(),
    byName: new Map(),
  };

  for (const node of graph.nodes.values()) {
    if (!indexes.byType.has(node.type)) {
      indexes.byType.set(node.type, []);
    }
    indexes.byType.get(node.type).push(node.id);

    if (!indexes.byTier.has(node.tier)) {
      indexes.byTier.set(node.tier, []);
    }
    indexes.byTier.get(node.tier).push(node.id);

    const key = normalizeName(node.name);
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
    meta: {
      invalidEdgesCount: invalidEdges.length,
      invalidEdges,
    },
  };
}
