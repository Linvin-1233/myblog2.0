// Why: tz-lookup 无官方类型；补一个最小声明。给定经纬度返回 IANA 时区名。
declare module "tz-lookup" {
  const tzlookup: (latitude: number, longitude: number) => string;
  export default tzlookup;
}
