// Why: gitalk 没有官方 @types 包，这里补最小类型，满足我们用到的
// 构造函数 + render 即可；CSS 侧效应导入也需一个模块声明。
declare module "gitalk" {
  export interface GitalkOptions {
    clientID: string;
    clientSecret: string;
    repo: string;
    owner: string;
    admin: string[];
    id?: string;
    title?: string;
    body?: string;
    language?: string;
    distractionFreeMode?: boolean;
    [key: string]: unknown;
  }

  export default class Gitalk {
    constructor(options: GitalkOptions);
    render(container: string | HTMLElement): void;
  }
}

declare module "gitalk/dist/gitalk.css";
