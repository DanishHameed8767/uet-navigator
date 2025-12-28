import GraphNode from "./GraphNode";
import GraphEdge from "./GraphEdge";

export default class Graph {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
  }

  addNode(node) {
    this.nodes.set(node.id, node);
  }

  addEdge(edge) {
    this.edges.set(edge.id, edge);
    edge.from.addEdge(edge);
  }

  getNode(id) {
    return this.nodes.get(id);
  }

  getNeighbors(nodeId, options = { navigableOnly: true }) {
    const node = this.nodes.get(nodeId);
    if (!node) {
      return [];
    }

    if (!options.navigableOnly) {
      return node.edges;
    }

    return node.edges.filter((e) => e.isNavigable());
  }

  nodeCount() {
    return this.nodes.size;
  }

  edgeCount() {
    return this.edges.size;
  }
}
