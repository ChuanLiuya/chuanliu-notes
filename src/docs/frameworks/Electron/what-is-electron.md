# Electron 是什么？

Electron 是一个用 Web 技术（HTML、CSS、JavaScript）开发跨平台桌面应用的框架。它把 **Chromium**（负责渲染页面）和 **Node.js**（提供系统能力）打包在一起，让你用前端的技能写出 Windows、macOS、Linux 都能跑的桌面软件。

::: tip 提示
你或许没必要看我的个人文档，而是去查看更权威的[官方文档](https://www.electronjs.org/zh/)
:::

## 核心组成

一个 Electron 应用由三块拼起来：

| 组成 | 作用 |
| --- | --- |
| Chromium | 渲染页面，提供浏览器环境 |
| Node.js | 提供文件系统、网络等系统能力 |
| Native API | 访问系统原生功能，如托盘、通知、剪贴板 |

所以你的代码里可以同时使用浏览器的 API（`document`、`window`）和 Node 的 API（`fs`、`path`）。

## 优点

- 一套代码三端运行，跨平台成本低
- 前端技术栈即可上手，无需学 C++/Rust
- 生态成熟，周边工具（打包、更新）完善

## 缺点

- 包体积大（每个应用都内置一个 Chromium）
- 内存占用高
- 性能上限不如原生应用

## 和浏览器开发的区别

Electron 里不是只有浏览器那一套，它引入了**进程**的概念：

- 主进程（Main Process）：Node 环境，管窗口和系统能力
- 渲染进程（Renderer Process）：浏览器环境，一个窗口一个
- 预加载脚本（Preload）：夹在中间做安全桥接

## 相关笔记

- [快速上手](/frameworks/Electron/quick-start)
- [预加载脚本](/frameworks/Electron/preload)
