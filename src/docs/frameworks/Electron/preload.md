# 预加载脚本 Preload

预加载脚本（preload）是运行在**主进程和渲染进程之间**的一个特殊脚本，负责把主进程的能力安全地"递"给页面。它是 Electron 应用里负责安全桥接的关键一环。

## 是什么

Electron 的主进程是一个拥有着完全操作系统访问权限的 Node.js 环境。 除了 Electron 模块，你还可以访问 Node.js 内置模块，以及任何通过 npm 安装的包。

另一方面，渲染进程默认跑在网页页面上，而并非 Node.js里。

为了将 Electron 的不同类型的进程桥接在一起，我们需要使用被称为**预加载**的特殊脚本。

用人话来说，就是
Electron 应用有主进程和渲染进程两个世界：

- **主进程**：Node.js 环境，看不到页面
- **渲染进程**：浏览器环境，能看到页面，但碰不到 Node

preload 夹在两者之间，**两边的能力都有**，用来让他们能相互访问。

预加载脚本在渲染器加载网页之前注入。

若要向渲染器添加需要权限才能访问到功能，可以通过electron模块的contextBridgeAPI定义global对象。

## 实战：通过 `preload` 增强渲染器

下面实战一下。

新建一个preload.js文件，该脚本通过versions这一全局变量，将Electron的process.versions对象暴露给渲染器。

```ts
//preload.js
const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  // 除函数之外，我们也可以暴露变量
});
```

为了将脚本附在渲染进程上，在BrowserWindow构造器上使用webPreferences.preload传入脚本路径。

```ts{10-12}
// main.js
const { app, BrowserWindow } = require('electron')

const path = require('node:path')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})

```

::: info

- \_\_dirname 字符串指向当前执行的脚本的路径。在本例中指向项目的根文件夹。
- path.joinAPI将多个路径连接在一起，创建一个跨平台的路径字符串。

:::
::: tip 提示
`__dirname` 是 Node 提供的当前文件所在目录，用 `path.join` 拼出绝对路径，避免相对路径在打包后失效。
:::

于是，现在渲染器能够全局访问versions了。

新建一个render.js脚本。

```ts
const information = document.getElementById("info");
information.innerText = `本应用正在使用 Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), 和 Electron (v${versions.electron()})`;
```

然后修改index.html

```html{19-20}
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <!-- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP -->
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'"
    />
    <meta
      http-equiv="X-Content-Security-Policy"
      content="default-src 'self'; script-src 'self'"
    />
    <title>Hello from Electron renderer!</title>
  </head>
  <body>
    <h1>Hello from Electron renderer!</h1>
    <p>👋</p>
    <p id="info"></p>
    <script src="./render.js"></script>
  </body>
</html>
```
现在你的应用应该已经在页面里显示版本号了。

## 实战：进程间通信

之前说过，Electron 的主进程和渲染进程分工明确、**不可互换**：渲染进程直接访问不了 Node.js 接口，主进程也碰不到 HTML 的 DOM。解决办法是使用**进程间通信（IPC）**。

Electron 提供了两个模块来通信：

- `ipcMain` —— 在主进程使用，负责监听
- `ipcRenderer` —— 在渲染进程使用，负责发送

下面演示：从网页向主进程发送一条消息，并拿到返回结果（`ping` → `pong`）。

### 1. preload 里暴露 invoke

在 preload 脚本中设置 `invoke` 调用，把它包装成一个全局函数 `ping()`：

```js
// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke("ping"),
  // 除函数之外，我们也可以暴露变量
});
```

::: warning IPC 安全
注意这里用辅助函数包裹了 `ipcRenderer.invoke("ping")`，而不是直接把 `ipcRenderer` 模块暴露给页面。**永远不要**通过 preload 直接暴露整个 `ipcRenderer`——那会让渲染进程能向主进程发送任意 IPC 消息，成为恶意代码最强的攻击媒介。
:::

### 2. 主进程注册 handler

在主进程用 `ipcMain.handle` 设置处理程序。要在 HTML 文件加载**之前**注册好，才能保证渲染进程发 `invoke` 时处理程序已就绪：

```js
// main.js
const { app, BrowserWindow, ipcMain } = require("electron/main");
const path = require("node:path");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("index.html");
};

app.whenReady().then(() => {
  ipcMain.handle("ping", () => "pong");
  createWindow();
});
```

### 3. 渲染进程调用

发送器和接收器都准备好后，渲染进程就能通过 `"ping"` 通道发消息给主进程了：

```js
// renderer.js
const func = async () => {
  const response = await window.versions.ping();
  console.log(response); // 打印 'pong'
};

func();
```

::: tip 提示
更深入的 `ipcRenderer` 和 `ipcMain` 用法，见官方[进程间通信指南](https://www.electronjs.org/zh/docs/latest/tutorial/ipc)。
:::

## 附录

### 背景

早期 Electron 默认允许渲染进程直接用 Node（`nodeIntegration: true`）。但这样一旦页面被注入恶意脚本，它就能随意读写文件，非常危险。所以现在的默认配置是：

- `contextIsolation: true` —— 页面和 preload 上下文隔离
- `nodeIntegration: false` —— 渲染进程不能用 Node API
- `sandbox: true` —— 渲染进程跑在沙箱里

渲染进程被"关进笼子"后，页面要拿系统能力（读文件、取版本号、调主进程），就得走 preload 这条**受控通道**。

### 沙盒是什么

沙盒（Sandbox）是一个**隔离箱**：里面的代码能正常跑，但被限制碰不到外面的系统资源。

其实你天天都在用沙盒——**浏览器里的网页就跑在沙盒里**。一个网页不能读你电脑里的文件，就是因为它被关在沙盒里；就算代码是恶意的，也只能在箱子里折腾，伤不到箱子外的东西。

Electron 的渲染进程（页面）和浏览器网页一样，也在沙盒里：

```text
┌─ 沙盒 ─────────────────────┐
│  页面（渲染进程）             │
│  没有 Node.js，不能读文件     │
└─────────────────────────────┘
        ▲  通过 IPC 喊话
        │
┌─ 沙盒外 ───────────────────┐
│  主进程：有完整系统权限        │  ← 能读文件、能开窗口
└─────────────────────────────┘
```

页面想读文件只能**喊话**给沙盒外的主进程代办，这就是 preload 和 IPC 存在的原因。

**预加载脚本沙盒化**：preload 这个"传话人"自己也住在沙盒里，只是被特许带了几个"通行证"——只能 require 少数几个模块（`contextBridge`、`ipcRenderer`、`events` 等），足够干"传话"这件事。它比页面权限高一点，但比主进程低得多。

## 相关笔记

- [Electron 是什么](/frameworks/Electron/what-is-electron)
- [快速上手](/frameworks/Electron/quick-start)
