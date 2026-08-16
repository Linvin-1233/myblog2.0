// Why: world-atlas 无官方类型；补最小声明。land-110m.json 是 TopoJSON，
// 由 topojson-client 的 feature() 转成 GeoJSON 陆地多边形。
declare module "world-atlas/land-110m.json" {
  const topology: { objects: { land: unknown } };
  export default topology;
}
