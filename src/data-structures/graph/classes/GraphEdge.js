export default class GraphEdge {
    constructor({ id, from, to, dist, type, twoWay = false, name = "" }) {
        this.id = id;
        this.from = from;
        this.to = to;
        this.dist = dist;
        this.type = type;
        this.twoWay = twoWay;
        this.name = name;

        this.weight = GraphEdge.computeWeight(dist, type);
    }

    static computeWeight(dist, type) {
        const speeds = {
            road: 30,
            street: 20,
        };
        return dist / (speeds[type] || 5);
    }

    isNavigable() {
        return this.type === "road" || this.type === "street";
    }
}
