// Why: 主题必须在首帧前定好，否则深/浅色会闪烁(FOUC)。静态导出的 HTML
// 里没有运行时服务器可读取偏好，只能靠这段在 <head> 最早执行的内联脚本：
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
  // How: suppressHydrationWarning 不适用于脚本本身；此脚本只写 DOM 属性，
  // 不参与 React diff，安全内联注入。
  return <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />;
}
