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
export function Comments({
  options,
  id,
  title,
}: {
  options: GitalkOptions;
  id: string;
  title: string;
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
      });
      gitalk.render("gitalk-container");
    });

    return () => {
      cancelled = true;
    };
  }, [options, id, title]);

  return <div id="gitalk-container" />;
}
