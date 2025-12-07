export const MAP_WIDTH = 12240;
export const MAP_HEIGHT = 7344;

const MIN_LON = 74.3500264050316133;
const MAX_LON = 74.3640297390315652;
const MIN_LAT = 31.5756894277684097;
const MAX_LAT = 31.584091428168378;

/**
 * Project geographic coordinates (lat, lon) into pixel coordinates (x, y)
 * on the PNG image.
 */
export function projectLatLon(lat, lon) {
  const x = ((lon - MIN_LON) / (MAX_LON - MIN_LON)) * MAP_WIDTH;

  const y = (1 - (lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * MAP_HEIGHT;

  return { x, y };
}

/**
 * Inverse of projectLatLon: from pixel coordinates (x, y)
 * back to geographic coordinates (lat, lon).
 */
export function unproject(x, y) {
  const lon = MIN_LON + (x / MAP_WIDTH) * (MAX_LON - MIN_LON);
  const lat = MAX_LAT - (y / MAP_HEIGHT) * (MAX_LAT - MIN_LAT);
  return { lat, lon };
}

/**
 * Build a map of projected node positions from raw OSM nodes.
 * nodes: { [id]: { lat, lon } }
 * returns: { [id]: { x, y } }
 */
export function buildProjectedNodes(nodes) {
  const projected = {};
  for (const [id, n] of Object.entries(nodes)) {
    projected[id] = projectLatLon(n.lat, n.lon);
  }
  return projected;
}

/**
 * Find the nearest OSM node (by squared lat/lon distance).
 * nodes: { [id]: { lat, lon } }
 * returns node id or null.
 */
export function findNearestNode(lat, lon, nodes) {
  let bestId = null;
  let bestDist = Infinity;

  for (const [id, n] of Object.entries(nodes)) {
    const dLat = lat - n.lat;
    const dLon = lon - n.lon;
    const dist2 = dLat * dLat + dLon * dLon;

    if (dist2 < bestDist) {
      bestDist = dist2;
      bestId = id;
    }
  }

  return bestId;
}
