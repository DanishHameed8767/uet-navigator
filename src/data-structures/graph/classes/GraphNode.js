export default class GraphNode {
    constructor({ id, lat, lon, type, tier, name = "" }) {
        this.id = id;
        this.lat = lat;
        this.lon = lon;
        this.type = type;
        this.tier = tier;
        this.name = name;
    }

    isNavigable() {
        return this.type !== "wall";
    }
}
