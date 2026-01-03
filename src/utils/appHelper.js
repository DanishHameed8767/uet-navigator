import storedNodes from "../../public/data/nodes.json";
import storedEdges from "../../public/data/edges.json";
import mapMatrix from "../../public/data/processed_map_matrix.json";

export const parseSafely = (data) => {
    try {
        return JSON.parse(data);
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const loadNodesData = () => {
    let savedNodes = localStorage.getItem("map-nodes");
    if (savedNodes) {
        savedNodes = parseSafely(savedNodes);
    } else {
        localStorage.setItem("map-nodes", JSON.stringify(storedNodes));
        savedNodes = storedNodes;
    }
    return savedNodes;
};

export const loadWalkData = () => {
    let mat = localStorage.getItem("map-walk-matrix");
    if (mat) {
        mat = parseSafely(mat);
    } else {
        localStorage.setItem("map-walk-matrix", JSON.stringify(mapMatrix));
        mat = mapMatrix;
    }
    return mat;
};

export const loadEdgesData = () => {
    let savedEdges = localStorage.getItem("map-edges");
    if (savedEdges) {
        savedEdges = parseSafely(savedEdges);
    } else {
        localStorage.setItem("map-edges", JSON.stringify(storedEdges));
        savedEdges = storedEdges;
    }
    return savedEdges;
};

export function getIconByType(type) {
    if (type === "road") return "fa-solid fa-road";
    if (type === "street") return "fa-solid fa-lines-leaning";
    if (type === "path") return "fa-solid fa-lines-leaning";
    if (type === "dept") return "fa-solid fa-graduation-cap";
    if (type === "hostel") return "fa-solid fa-bed";
    if (type === "cafe") return "fa-solid fa-utensils";
    if (type === "ground") return "fa-solid fa-table-tennis-paddle-ball";
    if (type === "worship") return "fa-solid fa-mosque";
    return "fa-solid fa-map-location-dot";
}
