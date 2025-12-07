export const MAP_WIDTH = 2846;
export const MAP_HEIGHT = 1398;

const MIN_LON = 74.34847825464949;
const MAX_LON = 74.3655827553648;
const MIN_LAT = 31.575686994992846;
const MAX_LAT = 31.584088994992843;

export function projectLatLon(lat, lon) {
  const x = ((lon - MIN_LON) / (MAX_LON - MIN_LON)) * MAP_WIDTH;

  const y = (1 - (lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * MAP_HEIGHT;

  return { x, y };
}
