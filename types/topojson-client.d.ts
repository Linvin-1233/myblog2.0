// Why: topojson-client 无官方类型；补最小声明。feature() 把 TopoJSON
// 对象转成 GeoJSON Feature(此处只用到 geometry.coordinates)。
declare module "topojson-client" {
  export function feature(
    topology: unknown,
    object: unknown,
  ): { type: "Feature"; geometry: { type: string; coordinates: unknown } };
}
