export type Coords = { lat: number; lng: number };

// How: 大圆(haversine)距离，单位公里；地球平均半径 6371km。
export function haversineKm(a: Coords, b: Coords): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// How: 免密钥的反向地理编码(BigDataCloud)，把经纬度转成城市·国家名；
// 拿不到具名地点或失败则返回 null(调用方自行决定回退，避免显示裸坐标)。
export async function reverseGeocode(c: Coords): Promise<string | null> {
  try {
    const url =
      "https://api.bigdatacloud.net/data/reverse-geocode-client" +
      `?latitude=${c.lat}&longitude=${c.lng}&localityLanguage=zh`;
    const res = await fetch(url);
    const data = await res.json();
    const place = [data.city || data.locality, data.countryName]
      .filter(Boolean)
      .join(" · ");
    return place || null;
  } catch {
    return null;
  }
}
