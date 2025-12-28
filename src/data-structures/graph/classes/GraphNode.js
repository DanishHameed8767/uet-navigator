export default class GraphNode {
  constructor({ id, lat, lon, x, y, type, tier, name = "" }) {
    this.id = id;

    this.lat = lat;
    this.lon = lon;
    this.x = x;
    this.y = y;

    this.type = type;
    this.tier = tier;
    this.name = name;

    this.edges = []; // Array<GraphEdge>
  }

  addEdge(edge) {
    this.edges.push(edge);
  }

  isNavigable() {
    return this.type !== "wall";
  }
}
