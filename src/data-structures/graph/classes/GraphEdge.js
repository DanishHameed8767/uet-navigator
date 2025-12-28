export default class GraphEdge {
  constructor({ id, from, to, dist, weight, type, name = "" }) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.dist = dist;
    this.weight = weight;
    this.type = type;
    this.name = name;
  }

  isNavigable() {
    return this.type === "road" || this.type === "street";
  }
}
