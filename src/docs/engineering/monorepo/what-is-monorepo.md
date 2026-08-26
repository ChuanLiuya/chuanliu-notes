# 什么是 Monorepo？

## 基础概念

Monorepo（Monolithic Repository，单体仓库）是一种**把多个项目放在同一个 Git 仓库里管理**的代码组织方式。

与之相对的是 **Polyrepo**（多仓库），即每个项目各自建一个独立的 Git 仓库。

## 你的项目是 Monorepo 吗？

用以下标准判断：

1. **根目录有 `workspaces` 配置**（`package.json` 中 `workspaces` 字段，或 `pnpm-workspace.yaml`）
2. **依赖统一管理** — 在根目录 `npm install` 能装好所有子包的依赖
3. **包之间可以互相引用** — 比如 `web` 可以直接 `import` `server` 里的共享代码

三个条件**同时满足**，才是真正的 Monorepo。如果只是把多个项目文件夹放在一起，那只是一个多项目文件夹，不是 Monorepo。

## 常用工具

最推荐的是 **pnpm workspaces**，速度快、磁盘占用少、依赖隔离严格，也是目前社区的主流选择。官方文档：`https://pnpm.io/workspaces`。

此外还有 npm workspaces、Yarn workspaces、Turborepo、Nx、Lerna 等，各有侧重，但核心思想一致。

## 优点

**代码共享方便** — 不需要发 npm 包，直接 `import` 就能共享类型、工具函数、配置。

**统一版本管理** — 所有子包版本号一起升，不会出现版本混乱。

**重构更安全** — 改一个共享模块，所有引用它的项目立刻报错，不会遗漏。

## 缺点

**仓库体积大** — 项目多了 `git clone` 会变慢，必要时用浅克隆（`--depth=1`）。

**构建时间长** — 所有项目一起构建，没配好缓存会很慢。

**权限控制困难** — 所有人能看见所有代码，无法按仓库粒度设权限。
