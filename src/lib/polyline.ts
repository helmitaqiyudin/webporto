export type LatLng = [number, number];

// Google encoded polyline format, precision 1e5.
export function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  const next = () => {
    let result = 0;
    let shift = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    return result & 1 ? ~(result >> 1) : result >> 1;
  };

  while (index < encoded.length) {
    lat += next();
    lng += next();
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

// Fits the route into the box with one scale for both axes (no stretching), centered, north up.
export function toSvgPath(points: LatLng[], width: number, height: number, padding: number): string {
  if (points.length < 2) return "";
  const lats = points.map((p) => p[0]);
  const lngs = points.map((p) => p[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const spanX = maxLng - minLng;
  const spanY = maxLat - minLat;
  const innerW = width - 2 * padding;
  const innerH = height - 2 * padding;
  const scale = Math.min(spanX > 0 ? innerW / spanX : Infinity, spanY > 0 ? innerH / spanY : Infinity);
  if (!Number.isFinite(scale)) return "";

  const offsetX = padding + (innerW - spanX * scale) / 2;
  const offsetY = padding + (innerH - spanY * scale) / 2;
  return points
    .map(([lat, lng], i) => {
      const x = offsetX + (lng - minLng) * scale;
      const y = offsetY + (maxLat - lat) * scale;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
