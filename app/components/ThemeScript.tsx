import Script from "next/script";

// Why: 主题必须在首帧前定好，否则深/浅色会闪烁(FOUC)。静态导出的 HTML
// 里没有运行时服务器可读取偏好，只能靠这段最早执行的内联脚本：
// 读取 localStorage 或系统偏好，立即写到 <html data-theme>，React 再接管。
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme-preference');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
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
