import Script from "next/script";

// Why: 真设备检测，不是断点。导航/菜单/轨道这类"设备形态"的 UI 靠它分流：
// 窄桌面窗口不该长出移动端菜单，平板即使窗口很宽也不该被当成桌面。
// How: 首帧前把 data-device 写到 <html>，CSS 用 [data-device] 分流，
// 服务端默认 desktop，移动端由这段最早执行的脚本改正，不会闪烁。
// 判定顺序：Client Hints(uaData.mobile) → UA 正则 → 触摸粗指针兜底。
const deviceInitScript = `
(function () {
  var root = document.documentElement;
  var mobile = false;
  try {
    var uaData = navigator.userAgentData;
    if (uaData && uaData.mobile === true) {
      mobile = true;
    } else {
      mobile = /Android|iPhone|iPad|iPod|Windows Phone|Mobile/i.test(navigator.userAgent);
    }
    if (!mobile && window.matchMedia) {
      mobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    }
  } catch (e) {
    mobile = false;
  }
  root.setAttribute("data-device", mobile ? "mobile" : "desktop");
})();
`;

export function DeviceScript() {
  return (
    <Script id="device-init" strategy="beforeInteractive">
      {deviceInitScript}
    </Script>
  );
}
