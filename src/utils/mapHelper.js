export const MAP_CONFIG = {
    p1: {
        x: 150,
        y: 371,
        lat: 31.583596822979406,
        lon: 74.35017532965013,
    },
    p2: {
        x: 6930,
        y: 3803,
        lat: 31.578362660382176,
        lon: 74.36228327374383,
    },
};

const getScales = () => {
    const { p1, p2 } = MAP_CONFIG;
    const latScale = (p2.lat - p1.lat) / (p2.y - p1.y);
    const lonScale = (p2.lon - p1.lon) / (p2.x - p1.x);
    return { latScale, lonScale };
};

export const pixelToLatLon = (x, y) => {
    const { p1 } = MAP_CONFIG;
    const { latScale, lonScale } = getScales();

    const lat = p1.lat + (y - p1.y) * latScale;
    const lon = p1.lon + (x - p1.x) * lonScale;

    return { lat, lon };
};

export const latLonToPixel = (lat, lon) => {
    const { p1 } = MAP_CONFIG;
    const { latScale, lonScale } = getScales();

    const x = p1.x + (lon - p1.lon) / lonScale;
    const y = p1.y + (lat - p1.lat) / latScale;

    return { x, y };
};

export const getDistance = (lat1, lon1, lat2, lon2) => {
    // Haversine Distance Formula
    const R = 6371e3;
    const phi1 = lat1 * (Math.PI / 180);
    const phi2 = lat2 * (Math.PI / 180);
    const deltaPhi = (lat2 - lat1) * (Math.PI / 180);
    const deltaLambda = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) *
            Math.cos(phi2) *
            Math.sin(deltaLambda / 2) *
            Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 100) / 100;
};
