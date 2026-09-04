import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

// https://vitepress.dev/reference/site-config
export default withMermaid(
  defineConfig({
    base: "/",
    lang: "zh-CN",
    title: "川柳笔记",
    description: "这里放我的个人笔记~",
    appearance: "force-dark",
    lastUpdated: true,
    markdown: {
      container: {
        tipLabel: "提示",
        warningLabel: "警告",
        dangerLabel: "危险",
        infoLabel: "信息",
        detailsLabel: "详细信息",
      },
    },
    themeConfig: {
      // https://vitepress.dev/reference/default-theme-config
      logo: "/logo.png",
      outline: { label: "大纲", level: "deep" },
      lastUpdated: { text: "最后更新于" },
      returnToTopLabel: "返回顶部",
      sidebarMenuLabel: "目录",
      docFooter: { prev: "上一页", next: "下一页" },

      nav: [{ text: "首页", link: "/" }],

      sidebar: [
        {
          text: "AI",
          collapsed: true,
          items: [
            {
              text: "MCP",
              collapsed: false,
              items: [
                { text: "MCP 是什么", link: "/ai/mcp/what-is-mcp" },
                { text: "构建MCP服务器", link: "/ai/mcp/build-server" },                { text: "TypeScript SDK 使用", link: "/ai/mcp/typescript-sdk" },              ],
            },
          ],
        },
        {
          text: "语言",
          collapsed: true,
          items: [
            {
              text: "Markdown",
              collapsed: true,
              items: [
                { text: "Markdown是什么", link: "/languages/Markdown/what-is-markdown" },
                { text: "基本语法", link: "/languages/Markdown/basic-syntax" },
                { text: "特殊语法", link: "/languages/Markdown/special-syntax" },
              ],
            },
            {
              text: "HTML",
              collapsed: true,
              items: [
                { text: "HTML 基础", link: "/languages/HTML/index" },
              ],
            },
            {
              text: "CSS",
              collapsed: true,
              items: [
                { text: "CSS动画", link: "/languages/CSS/animation" },
                { text: "盒模型", link: "/languages/CSS/box-model" },
                { text: "Grid 布局", link: "/languages/CSS/grid" },
              ],
            },
            {
              text: "JavaScript",
              collapsed: true,
              items: [
                {
                  text: "全局对象",
                  collapsed: true,
                  items: [
                    {
                      text: "Proxy",
                      link: "/languages/JavaScript/global-objects/proxy",
                    },
                  ],
                },
                {
                  text: "执行上下文",
                  link: "/languages/JavaScript/execution-context",
                },
                {
                  text: "原型与原型链",
                  link: "/languages/JavaScript/prototype-chain",
                },
                {
                  text: "事件循环",
                  link: "/languages/JavaScript/event-loop",
                },
                {
                  text: "Promise",
                  link: "/languages/JavaScript/promise",
                },
              ],
            },
            {
              text: "TypeScript",
              collapsed: true,
              items: [
                {
                  text: "TypeScript是什么",
                  link: "/languages/TypeScript/index",
                },
                {
                  text: "快速上手",
                  link: "/languages/TypeScript/quick-start",
                },
                {
                  text: "编译构建",
                  link: "/languages/TypeScript/build",
                },
                {
                  text: "tsconfig.json",
                  link: "/languages/TypeScript/tsconfig",
                },
                {
                  text: "compilerOptions 字段详解",
                  link: "/languages/TypeScript/compiler-options",
                },
                {
                  text: "基础类型",
                  link: "/languages/TypeScript/basic-types",
                },
              ],
            },
            {
              text: "Node.js",
              collapsed: true,
              items: [
                { text: "Node.js 模块", link: "/languages/Node.js/modules" },
                { text: "依赖管理", link: "/languages/Node.js/dependencies" },
              ],
            },
            {
              text: "笔试题",
              collapsed: true,
              items: [
                {
                  text: "基础",
                  link: "/languages/written-test/base",
                },
                {
                  text: "数字组合",
                  link: "/languages/written-test/number-combination",
                },
                {
                  text: "字符串变换",
                  link: "/languages/written-test/string-transform",
                },
              ],
            },
          ],
        },
        {
          text: "框架",
          collapsed: true,
          items: [
            {
              text: "Vue3",
              collapsed: true,
              items: [
                {
                  text: "深入组件",
                  items: [
                    {
                      text: "属性透传",
                      link: "/frameworks/Vue3/attributes-inheritance",
                    },
                  ],
                },
              ],
            },
            {
              text: "VitePress",
              collapsed: false,
              items: [
                {
                  text: "VitePress是什么",
                  link: "/frameworks/VitePress/what-is-vitepress",
                },
                {
                  text: "快速上手",
                  link: "/frameworks/VitePress/quick-start",
                },
                {
                  text: "在VitePress中使用vue",
                  link: "/frameworks/VitePress/using-vue",
                },
              ],
            },
            {
              text: "NaiveUI",
              collapsed: true,
              items: [
                {
                  text: "开始",
                  collapsed: true,
                  items: [
                    {
                      text: "NaiveUI是什么",
                      link: "/frameworks/NaiveUI/what-is-NaiveUI",
                    },
                    {
                      text: "快速上手",
                      link: "/frameworks/NaiveUI/quick-start",
                    },
                  ],
                },
                {
                  text: "指南",
                  collapsed: true,
                  items: [
                    {
                      text: "引入方法",
                      link: "/frameworks/NaiveUI/import-on-demand",
                    },
                    {
                      text: "配置字体",
                      link: "/frameworks/NaiveUI/fonts",
                    },
                  ],
                },
                {
                  text: "组件",
                  collapsed: true,
                  items: [
                    {
                      text: "Form 表单",
                      link: "/frameworks/NaiveUI/form",
                    },
                  ],
                },
              ],
            },
            {
              text: "Electron",
              collapsed: false,
              items: [
                {
                  text: "Electron是什么",
                  link: "/frameworks/Electron/what-is-electron",
                },
                {
                  text: "快速上手",
                  link: "/frameworks/Electron/quick-start",
                },
                {
                  text: "预加载脚本",
                  link: "/frameworks/Electron/preload",
                },
              ],
            },
            {
              text: "NestJS",
              collapsed: false,
              items: [
                {
                  text: "开始",
                  collapsed: true,
                  items: [
                    {
                      text: "什么是NestJS?",
                      link: "/frameworks/NestJS/what-is-nestjs",
                    },
                    {
                      text: "快速上手",
                      link: "/frameworks/NestJS/quick-start",
                    },
                  ],
                },
                {
                  text: "基础",
                  collapsed: true,
                  items: [
                    {
                      text: "请求生命周期",
                      link: "/frameworks/NestJS/request-lifecycle",
                    },
                    {
                      text: "中间件",
                      link: "/frameworks/NestJS/middleware",
                    },
                    {
                      text: "守卫",
                      link: "/frameworks/NestJS/guard",
                    },
                    {
                      text: "模块与依赖注入",
                      link: "/frameworks/NestJS/module-di",
                    },
                    {
                      text: "RESTful API 与 DTO",
                      link: "/frameworks/NestJS/rest-api",
                    },
                    {
                      text: "异常过滤器",
                      link: "/frameworks/NestJS/middleware-filter",
                    },
                    {
                      text: "Guard 与 Strategy 详解",
                      link: "/frameworks/NestJS/auth-guard-strategy",
                    },
                  ],
                },
                {
                  text: "技术",
                  collapsed: true,
                  items: [
                    {
                      text: "身份认证",
                      link: "/frameworks/NestJS/authorization",
                    },
                    {
                      text: "自定义装饰器",
                      link: "/frameworks/NestJS/custom-decorator",
                    },
                    {
                      text: "评论系统",
                      link: "/frameworks/NestJS/comment-system",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          text: "数据层",
          collapsed: true,
          items: [
            {
              text: "MySQL",
              collapsed: true,
              items: [
                { text: "MySQL是什么", link: "/data/mysql/what-is-mysql" },
                { text: "快速上手", link: "/data/mysql/quick-start" },
              ],
            },
            {
              text: "TypeORM",
              collapsed: true,
              items: [
                {
                  text: "基础概念",
                  collapsed: true,
                  items: [
                    {
                      text: "TypeORM是什么",
                      link: "/data/typeorm/basics/what-is-typeorm",
                    },
                    {
                      text: "快速上手",
                      link: "/data/typeorm/basics/quick-start",
                    },
                    {
                      text:"分步指南",
                      link:"/data/typeorm/basics/steps"
                    }
                  ],
                },

              ],
            },
          ],
        },
        {
          text: "工程化",
          collapsed: true,
          items: [
            {
              text: "Monorepo",
              collapsed: false,
              items: [
                {
                  text: "什么是 Monorepo？",
                  link: "/engineering/monorepo/what-is-monorepo",
                },
                { text: "快速上手", link: "/engineering/monorepo/quick-start" },
              ],
            },
            {
              text: "package.json",
              collapsed: false,
              items: [
                {
                  text: "package.json是什么",
                  link: "/engineering/package.json/what-is-package-json",
                },
                {
                  text: "字段详解",
                  link: "/engineering/package.json/fields",
                },
              ],
            },
          ],
        },
        {
          text: "运维",
          collapsed: true,
          items: [
            {
              text: "Docker",
              collapsed: true,
              items: [
                {
                  text: "开始",
                  collapsed: true,
                  items: [
                    { text: "什么是Docker?", link: "/devops/docker/what-is-docker" },
                    { text: "快速上手", link: "/devops/docker/quick-start" },
                    { text: "常用命令", link: "/devops/docker/common-commands" },
                    { text: "基本概念", link: "/devops/docker/basic-concepts" },
                  ],
                },
                {
                  text: "进阶",
                  collapsed: true,
                  items: [
                    { text: "进阶", link: "/devops/docker/advanced" },
                    { text: "挂载卷", link: "/devops/docker/volumes" },
                  ],
                },
              ],
            },
            {
              text: "Git",
              collapsed: true,
              items: [
                { text: "什么是Git？", link: "/devops/git/what-is-git" },
                { text: "Git快速上手", link: "/devops/git/quick-start" },
                { text: "Git 工作流程", link: "/devops/git/git-workflow" },
                { text: "Git 基础操作", link: "/devops/git/git-basic-operations" },
                { text: "GitFlow 工作流", link: "/devops/git/gitflow" },
              ],
            },
          ],
        },
        {
          text: "网络小知识",
          collapsed: true,
          items: [
            { text: "SSH远程连接", link: "/internet-tips/ssh" },
            { text: "CI/CD自动化部署", link: "/internet-tips/ci-cd" },
            { text: "WebSocket 实时通信", link: "/internet-tips/websocket" },
          ],
        },
      ],

      socialLinks: [
        { icon: "github", link: "https://github.com/ChuanLiuya" },
        {
          icon: {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"/></svg>',
          },
          link: "https://www.bilibili.com/video/BV1UT42167xb/?spm_id_from=333.788.recommend_more_video.1&trackid=web_related_0.router-related-2479604-grjpt.1784196050262.212",
          ariaLabel: "切换语言",
        },
      ],
    },

    srcDir: "./src",

    // 将 src/docs/xxx.md 映射为 /xxx（去掉 /docs/ 前缀）
    rewrites: {
      "docs/:rest*": ":rest*",
    },

    vite: {
      resolve: {
        alias: {
          "@components": new URL("../src/components", import.meta.url).pathname,
        },
      },
    },

    // mermaid 图表配置
    mermaid: {
      theme: "dark",
    },
  }),
);
