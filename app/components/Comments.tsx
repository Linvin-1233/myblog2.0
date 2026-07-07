"use client";

import { useEffect, useRef } from "react";
import "gitalk/dist/gitalk.css";

export type GitalkOptions = {
  clientID: string;
  clientSecret: string;
  repo: string;
  owner: string;
  admin: string[];
};

// Why: Gitalk 是基于 GitHub Issues 的纯前端评论组件，契合静态站点(无后端)。
// 配置由服务端从 config.yml 读出后以 props 传入，避免把读文件的模块带进客户端包。
// proxy 模式下，token 交换走本站 /api/gitalk 中继，改善国内直连 GitHub 的稳定性。
export function Comments({
  options,
  id,
  title,
  proxy,
}: {
  options: GitalkOptions;
  id: string;
  title: string;
  proxy: boolean;
}) {
  const rendered = useRef(false);

  useEffect(() => {
    // How: 严格模式下 effect 会跑两次；用 ref 保证 Gitalk 只初始化渲染一次。
    if (rendered.current) return;
    rendered.current = true;

    let cancelled = false;
    // How: 动态 import 让 gitalk 只在浏览器加载，规避构建期预渲染触碰 window。
    import("gitalk").then(({ default: Gitalk }) => {
      if (cancelled) return;
      const gitalk = new Gitalk({
        clientID: options.clientID,
        clientSecret: options.clientSecret,
        repo: options.repo,
        owner: options.owner,
        admin: options.admin,
        // Why: Gitalk 要求 id 长度 <= 50，用文章 slug 并截断以满足限制。
        id: id.slice(0, 50),
        title,
        distractionFreeMode: false,
        // How: proxy=true 时让 Gitalk 把 OAuth token 交换 POST 到本站 API
        // 路由(而非直连 github.com)，规避国内网络 + CORS 问题。
        ...(proxy ? { proxy: `${location.origin}/api/gitalk/` } : {}),
      });
      gitalk.render("gitalk-container");
    });

    return () => {
      cancelled = true;
    };
  }, [options, id, title, proxy]);

  return <div id="gitalk-container" />;
}
