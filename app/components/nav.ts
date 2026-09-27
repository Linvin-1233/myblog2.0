// Why: 导航项被站点头部与页脚共用；集中一处避免两处链接顺序/文案漂移。
export const navItems = [
  { href: "/", label: "HOME" },
  { href: "/posts", label: "POSTS" },
  { href: "/tags", label: "TAGS" },
  { href: "/archive", label: "ARCHIVE" },
  { href: "/search", label: "SEARCH" },
  { href: "/geo", label: "GEO" },
  { href: "/about", label: "ABOUT" },
] as const;

export type NavItem = (typeof navItems)[number];
