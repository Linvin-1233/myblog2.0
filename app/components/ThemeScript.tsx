import Script from "next/script";

// Why: 主题必须在首帧前定好，否则深/浅色会闪烁(FOUC)。静态导出的 HTML
// 里没有运行时服务器可读取偏好，只能靠这段最早执行的内联脚本：
// 读取 localStorage 或系统偏好，立即写到 <html data-theme>，React 再接管。
// How: 同一次执行里写上 data-js="on"。滚动动效的初始位移只挂在
// [data-js="on"] 之下，所以：脚本没跑 → 内容完全可见(动效只是增强，
// 不能成为内容可读的前提)；脚本跑了 → 首帧就是隐藏态，不会先闪一下再动。
const themeInitScript = `
(function () {
  var root = document.documentElement;
  root.setAttribute('data-js', 'on');
  try {
    var stored = localStorage.getItem('theme-preference');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    root.setAttribute('data-theme', theme);
  } catch (e) {
    root.setAttribute('data-theme', 'dark');
  }
})();
`;

export function ThemeScript() {
  // How: 用 next/script(beforeInteractive) 而非裸 <script>——后者会在客户端
  // 导航时被 React 重新渲染并报"script 不会执行"的错误；next/script 由 Next
  // 在初始 HTML 注入并只执行一次，避开该问题，同时仍先于水合运行、防闪烁。
  return (
    <Script id="theme-init" strategy="beforeInteractive">
      {themeInitScript}
    </Script>
  );
}
