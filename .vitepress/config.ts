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

      nav: [
        { text: "首页", link: "/" },
        { text: "技术", link: "/technology/ai/mcp/what-is-mcp" },
        { text: "娱乐", link: "/entertainment/unity/execution-order" },
      ],

      // 两套侧边栏按页面路径自动切换：
      //   /technology/     技术章节
      //   /entertainment/  娱乐章节（Unity 及后续新增内容）
      sidebar: {
        // ===== 技术章节 =====
        "/technology/": [
          {
            text: "AI",
            collapsed: true,
            items: [
              {
                text: "MCP",
                collapsed: false,
                items: [
                  { text: "MCP 是什么", link: "/technology/ai/mcp/what-is-mcp" },
                  { text: "构建MCP服务器", link: "/technology/ai/mcp/build-server" },
                  { text: "TypeScript SDK 使用", link: "/technology/ai/mcp/typescript-sdk" },
                ],
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
                  { text: "Markdown是什么", link: "/technology/languages/Markdown/what-is-markdown" },
                  { text: "基本语法", link: "/technology/languages/Markdown/basic-syntax" },
                  { text: "特殊语法", link: "/technology/languages/Markdown/special-syntax" },
                ],
              },
              {
                text: "HTML",
                collapsed: true,
                items: [
                  { text: "HTML 基础", link: "/technology/languages/HTML/index" },
                ],
              },
              {
                text: "CSS",
                collapsed: true,
                items: [
                  { text: "CSS动画", link: "/technology/languages/CSS/animation" },
                  { text: "盒模型", link: "/technology/languages/CSS/box-model" },
                  { text: "Grid 布局", link: "/technology/languages/CSS/grid" },
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
                        link: "/technology/languages/JavaScript/global-objects/proxy",
                      },
                    ],
                  },
                  {
                    text: "执行上下文",
                    link: "/technology/languages/JavaScript/execution-context",
                  },
                  {
                    text: "原型与原型链",
                    link: "/technology/languages/JavaScript/prototype-chain",
                  },
                  {
                    text: "事件循环",
                    link: "/technology/languages/JavaScript/event-loop",
                  },
                  {
                    text: "Promise",
                    link: "/technology/languages/JavaScript/promise",
                  },
                ],
              },
              {
                text: "TypeScript",
                collapsed: true,
                items: [
                  {
                    text: "TypeScript是什么",
                    link: "/technology/languages/TypeScript/index",
                  },
                  {
                    text: "快速上手",
                    link: "/technology/languages/TypeScript/quick-start",
                  },
                  {
                    text: "编译构建",
                    link: "/technology/languages/TypeScript/build",
                  },
                  {
                    text: "tsconfig.json",
                    link: "/technology/languages/TypeScript/tsconfig",
                  },
                  {
                    text: "compilerOptions 字段详解",
                    link: "/technology/languages/TypeScript/compiler-options",
                  },
                  {
                    text: "基础类型",
                    link: "/technology/languages/TypeScript/basic-types",
                  },
                ],
              },
              {
                text: "Node.js",
                collapsed: true,
                items: [
                  { text: "Node.js 模块", link: "/technology/languages/Node.js/modules" },
                  { text: "依赖管理", link: "/technology/languages/Node.js/dependencies" },
                ],
              },
              {
                text: "笔试题",
                collapsed: true,
                items: [
                  {
                    text: "基础",
                    link: "/technology/languages/written-test/base",
                  },
                  {
                    text: "数字组合",
                    link: "/technology/languages/written-test/number-combination",
                  },
                  {
                    text: "字符串变换",
                    link: "/technology/languages/written-test/string-transform",
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
                        link: "/technology/frameworks/Vue3/attributes-inheritance",
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
                    link: "/technology/frameworks/VitePress/what-is-vitepress",
                  },
                  {
                    text: "快速上手",
                    link: "/technology/frameworks/VitePress/quick-start",
                  },
                  {
                    text: "在VitePress中使用vue",
                    link: "/technology/frameworks/VitePress/using-vue",
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
                        link: "/technology/frameworks/NaiveUI/what-is-NaiveUI",
                      },
                      {
                        text: "快速上手",
                        link: "/technology/frameworks/NaiveUI/quick-start",
                      },
                    ],
                  },
                  {
                    text: "指南",
                    collapsed: true,
                    items: [
                      {
                        text: "引入方法",
                        link: "/technology/frameworks/NaiveUI/import-on-demand",
                      },
                      {
                        text: "配置字体",
                        link: "/technology/frameworks/NaiveUI/fonts",
                      },
                    ],
                  },
                  {
                    text: "组件",
                    collapsed: true,
                    items: [
                      {
                        text: "Form 表单",
                        link: "/technology/frameworks/NaiveUI/form",
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
                    link: "/technology/frameworks/Electron/what-is-electron",
                  },
                  {
                    text: "快速上手",
                    link: "/technology/frameworks/Electron/quick-start",
                  },
                  {
                    text: "预加载脚本",
                    link: "/technology/frameworks/Electron/preload",
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
                        link: "/technology/frameworks/NestJS/what-is-nestjs",
                      },
                      {
                        text: "快速上手",
                        link: "/technology/frameworks/NestJS/quick-start",
                      },
                    ],
                  },
                  {
                    text: "基础",
                    collapsed: true,
                    items: [
                      {
                        text: "请求生命周期",
                        link: "/technology/frameworks/NestJS/request-lifecycle",
                      },
                      {
                        text: "中间件",
                        link: "/technology/frameworks/NestJS/middleware",
                      },
                      {
                        text: "守卫",
                        link: "/technology/frameworks/NestJS/guard",
                      },
                      {
                        text: "模块与依赖注入",
                        link: "/technology/frameworks/NestJS/module-di",
                      },
                      {
                        text: "RESTful API 与 DTO",
                        link: "/technology/frameworks/NestJS/rest-api",
                      },
                      {
                        text: "异常过滤器",
                        link: "/technology/frameworks/NestJS/middleware-filter",
                      },
                      {
                        text: "Guard 与 Strategy 详解",
                        link: "/technology/frameworks/NestJS/auth-guard-strategy",
                      },
                    ],
                  },
                  {
                    text: "技术",
                    collapsed: true,
                    items: [
                      {
                        text: "身份认证",
                        link: "/technology/frameworks/NestJS/authorization",
                      },
                      {
                        text: "自定义装饰器",
                        link: "/technology/frameworks/NestJS/custom-decorator",
                      },
                      {
                        text: "评论系统",
                        link: "/technology/frameworks/NestJS/comment-system",
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
                  { text: "MySQL是什么", link: "/technology/data/mysql/what-is-mysql" },
                  { text: "快速上手", link: "/technology/data/mysql/quick-start" },
                  { text: "数据库操作", link: "/technology/data/mysql/sql-database" },
                  { text: "数据表操作", link: "/technology/data/mysql/sql-table" },
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
                        link: "/technology/data/typeorm/basics/what-is-typeorm",
                      },
                      {
                        text: "快速上手",
                        link: "/technology/data/typeorm/basics/quick-start",
                      },
                      {
                        text: "分步指南",
                        link: "/technology/data/typeorm/basics/steps",
                      },
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
                    link: "/technology/engineering/monorepo/what-is-monorepo",
                  },
                  { text: "快速上手", link: "/technology/engineering/monorepo/quick-start" },
                ],
              },
              {
                text: "package.json",
                collapsed: false,
                items: [
                  {
                    text: "package.json是什么",
                    link: "/technology/engineering/package.json/what-is-package-json",
                  },
                  {
                    text: "字段详解",
                    link: "/technology/engineering/package.json/fields",
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
                      { text: "什么是Docker?", link: "/technology/devops/docker/what-is-docker" },
                      { text: "快速上手", link: "/technology/devops/docker/quick-start" },
                      { text: "常用命令", link: "/technology/devops/docker/common-commands" },
                      { text: "基本概念", link: "/technology/devops/docker/basic-concepts" },
                    ],
                  },
                  {
                    text: "进阶",
                    collapsed: true,
                    items: [
                      { text: "进阶", link: "/technology/devops/docker/advanced" },
                      { text: "挂载卷", link: "/technology/devops/docker/volumes" },
                    ],
                  },
                ],
              },
              {
                text: "Git",
                collapsed: true,
                items: [
                  { text: "什么是Git？", link: "/technology/devops/git/what-is-git" },
                  { text: "Git快速上手", link: "/technology/devops/git/quick-start" },
                  { text: "Git 工作流程", link: "/technology/devops/git/git-workflow" },
                  { text: "Git 基础操作", link: "/technology/devops/git/git-basic-operations" },
                  { text: "GitFlow 工作流", link: "/technology/devops/git/gitflow" },
                ],
              },
            ],
          },
          {
            text: "网络小知识",
            collapsed: true,
            items: [
              { text: "SSH远程连接", link: "/technology/internet-tips/ssh" },
              { text: "CI/CD自动化部署", link: "/technology/internet-tips/ci-cd" },
              { text: "WebSocket 实时通信", link: "/technology/internet-tips/websocket" },
            ],
          },
        ],

        // ===== 娱乐章节 =====
        // 以后新增的娱乐内容，在下面这个数组里再加一个分组即可
        "/entertainment/": [
          {
            text: "Unity",
            collapsed: false,
            items: [
              {
                text: "执行顺序",
                link: "/entertainment/unity/execution-order",
              },
              {
                text: "输入系统",
                link: "/entertainment/unity/input-system",
              },
              {
                text: "跳跃逻辑",
                link: "/entertainment/unity/jump-logic",
              },
              {
                text: "特性（Attribute）",
                link: "/entertainment/unity/attribute",
              },
              {
                text: "组件",
                collapsed: false,
                items: [
                  {
                    text: "Rigidbody2D 刚体",
                    link: "/entertainment/unity/components/rigidbody-2d",
                  },
                  {
                    text: "BoxCollider2D 盒碰撞体",
                    link: "/entertainment/unity/components/box-collider-2d",
                  },
                  {
                    text: "PolygonCollider2D 多边形碰撞体",
                    link: "/entertainment/unity/components/polygon-collider-2d",
                  },
                ],
              },
            ],
          },
        ],
      },

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
