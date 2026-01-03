import { computeWeight } from "../../../utils/mapHelper";

export default class GraphEdge {
    constructor({ id, from, to, dist, type, twoWay = false, name = "" }) {
        this.id = id;
        this.from = from;
        this.to = to;
        this.dist = dist;
        this.type = type;
        this.twoWay = twoWay;
        this.name = name;
        this.weight = computeWeight(dist, type);
    }

    isNavigable() {
        return this.type === "road" || this.type === "street";
    }
}
