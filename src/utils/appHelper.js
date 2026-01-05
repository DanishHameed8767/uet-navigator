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

export function timeAgo(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1,
    };

    if (seconds < 30) {
        return "Just now";
    }

    const isYesterday =
        new Date(now.getTime() - 86400000).getDate() === date.getDate();
    if (seconds < intervals.day * 2 && isYesterday) {
        return "Yesterday";
    }

    let counter;
    for (const [unit, value] of Object.entries(intervals)) {
        counter = Math.floor(seconds / value);
        if (counter > 0) {
            if (counter === 1) {
                return `${counter} ${unit} ago`;
            } else {
                return `${counter} ${unit}s ago`;
            }
        }
    }

    return "Just now";
}