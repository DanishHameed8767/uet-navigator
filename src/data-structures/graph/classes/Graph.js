export default class Graph {
    constructor() {
        this.nodes = new Map();
        this.edges = new Map();
        this.adjacency = new Map();
    }

    addNode(node) {
        this.nodes.set(node.id, node);
        if (!this.adjacency.has(node.id)) {
            this.adjacency.set(node.id, []);
        }
    }

    addEdge(edge) {
        this.edges.set(edge.id, edge);

        if (!this.adjacency.has(edge.from)) {
            this.adjacency.set(edge.from, []);
        }
        this.adjacency.get(edge.from).push(edge);

        if (edge.twoWay) {
            if (!this.adjacency.has(edge.to)) {
                this.adjacency.set(edge.to, []);
            }
            this.adjacency.get(edge.to).push(edge);
        }
    }

    getNode(id) {
        return this.nodes.get(id);
    }

    getNeighbors(nodeId, { navigableOnly = true } = {}) {
        const edges = this.adjacency.get(nodeId) || [];
        return navigableOnly ? edges.filter((e) => e.isNavigable()) : edges;
    }

    nodeCount() {
        return this.nodes.size;
    }

    edgeCount() {
        return this.edges.size;
    }
}
