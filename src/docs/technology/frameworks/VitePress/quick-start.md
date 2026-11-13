# 快速开始

本指南将带你从零开始，用最短的时间搭建一个 VitePress 文档站点。

## 前置准备

在开始之前，请确保你的开发环境满足以下要求：

### 必须的环境

- **Node.js 22 及以上版本**

  >推荐使用 `nvm`（Node 版本管理器）来安装和管理 Node.js 版本。

  验证安装是否成功：

  ```bash
  node -v   # 应输出 v22.x.x
  npm -v    # 应输出 10.x.x 或更高
  ```

### 推荐的编辑器

- **[VS Code](https://code.visualstudio.com/)** + [Vue - Official 扩展](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

  Vue 官方扩展提供了 `.vue` 文件和 `.md` 文件中 Vue 语法的语法高亮、智能提示等功能，极大提升写作体验。

## 第一步：创建项目目录

```bash
# 创建并进入项目目录
mkdir my-vitepress-site
cd my-vitepress-site

# 初始化 package.json
npm init -y
```
---

## 第二步：安装 VitePress

在你的项目目录中安装 VitePress 作为开发依赖：

::: code-group

```bash [npm]
npm add -D vitepress
```

```bash [pnpm]
pnpm add -D vitepress
```

```bash [yarn]
yarn add -D vitepress
```

```bash [bun]
bun add -D vitepress
```

:::

---

## 第三步：初始化 VitePress

运行初始化向导，它会引导你完成基础设置：

```bash
npx vitepress init
```

会依次询问你以下问题，按提示回答即可：

```bash
┌  Welcome to VitePress! #欢迎来到vitepress！
│
◇  Where should VitePress initialize the config? #站点根目录放在哪里？
│  ./docs
│
◇  Where should VitePress look for your markdown files?
│  ./docs
│
◇  Site title: #设置标题
│  My Awesome Project
│
◇  Site description: #设置描述
│  A VitePress Site
│
◇  Theme: #设置主题，推荐默认主题。
│  Default Theme
│
◇  Use TypeScript for config and theme files? #是否使用typescript管理config
│  Yes
│
◇  Add VitePress npm scripts to package.json? #在package.json中加入npm的script
│  Yes
│
◇  Add a prefix for VitePress npm scripts? #是否在script加前缀？
│  Yes
│
◇  Prefix for VitePress npm scripts: #加什么前缀？
│  docs
│
└  Done! Now run npm run docs:dev and start writing. #完成！现在输入 npm run docs:dev 并且开始写作吧！

```

初始化完成后，你的项目结构如下：

```
my-vitepress-site/
├── .vitepress/             # 配置目录
│   ├── config.ts           # 核心配置文件
│   └── cache/              # 开发缓存（自动生成）
├── src/                    # 文档源文件
│   ├── index.md            # 首页
│   ├── api-examples.md     # API 示例
│   └── markdown-examples.md
├── package.json
└── node_modules/
```

---

## 第四步：启动开发服务器

一切就绪，启动开发服务器看看效果吧：

::: code-group

```bash [npm]
npm run docs:dev
```

```bash [pnpm]
pnpm run docs:dev
```

```bash [yarn]
yarn docs:dev
```

```bash [bun]
bun run docs:dev
```

:::

默认会在 `http://localhost:5173` 启动，打开浏览器就能看到你的文档站啦！

::: tip 热更新
VitePress 基于 Vite，开发模式下所有 Markdown 和配置文件的修改都会**即时热更新**，无需手动刷新浏览器
:::

## 第五步：构建与预览

当你写完文档准备发布时，需要构建生产版本：

::: code-group

```bash [npm]
npm run docs:build
```

```bash [pnpm]
pnpm run docs:build
```

```bash [yarn]
yarn docs:build
```

```bash [bun]
bun run docs:build
```

:::

构建产物会生成在 `.vitepress/dist/` 目录中。

想本地预览构建结果？运行：

::: code-group

```bash [npm]
npm run docs:preview
```

```bash [pnpm]
pnpm run docs:preview
```

```bash [yarn]
yarn docs:preview
```

```bash [bun]
bun run docs:preview
```

:::

---

## 下一步

现在你已经成功搭建了一个 VitePress 文档站，接下来可以学习：

- Markdown语法 — 掌握 Markdown 的基本语法
- 配置文件详解 — 了解导航栏、侧边栏等核心配置
- Markdown拓展 — 掌握 VitePress 中的 Markdown 高级语法
- 部署指南 — 把站点发布到线上

::: tip 小提示
如果在初始化过程中遇到任何问题，可以随时回到上一步重新来，或者直接手动创建配置文件
:::