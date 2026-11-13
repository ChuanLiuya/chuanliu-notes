# Electron 快速上手

这篇文档会带你上手你的第一个应用程序。

## 前置准备

1. Electron需要您对Node.js与Web有一定的了解。
2. 代码编辑器，建议使用vscode。
3. 命令行工具，基本上pc都会有。
4. Node.js与npm环境。

## 初始化一个npm项目

新建一个文件夹，然后执行`npm init`

建成之后默认应该是这样的：

```json
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC"
}
```

然后，修改入口点`main`为`main.js`

## 安装依赖

- 安装`Electron`为`devDependencies`

```bash
npm i electron --save-dev
```

## 添加.gitignore文件

建议直接去[官方](https://github.com/github/gitignore/blob/main/Node.gitignore)那里复制一份

## 编写代码

创建main.js，然后写一行代码：

```ts
console.log("hello, worrrrrrrrrrrrrrld!");
```

## 运行应用

在package.json中添加scripts字段的一个属性,

```json{7}
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "description": "",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "chuanliuya",
  "license": "ISC",
  "devDependencies": {
    "electron": "^43.3.0"
  }
}

```

输入：

```bash
npm start
```

```
PS D:\my-projects\test\electron-test\my-electron-app> npm start

> my-electron-app@1.0.0 start
> electron .

Downloading Electron binary...

hello, worrrrrrrrrrrrrrld!
```

成功！

## 将网页放到 BrowserWindow 中

在Electron中，每个窗口展示一个页面。

在根目录创建一个 `index.html` 文件，随便写点什么。

::: details index.html的例子

````html
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
  </body>
</html>
``` :::
````

现在有网页了，可以让这个网页加载到一个Electron的BrowserWindow上了。将main.js换成如下代码：

```ts
const { app, BrowserWindow } = require("electron");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  win.loadFile("index.html");
};

app.whenReady().then(() => {
  createWindow();
});
```

:::

## 管理应用生命周期

人话：弄一个能退出的界面，要不打开了关不了。

先弄一个这个逻辑：关闭所有窗口时，退出应用。

``` ts
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
```
nodejs中process.platform变量，能看到用户运行的平台。这个函数的意思是，当所有窗口关闭，并且用户不使用macOS，调用app.quit()来退出应用程序。

再弄一个这个逻辑：如果没有窗口开着，应用程序还在跑，那就打开一个窗口(macOS)

macOS平台，就算没有打开窗口，程序也能运行。
``` ts
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
```

好了，现在开始运行`npm start`吧！


## 附录

### main.js

#### 1. 导入模块

在第一行中，我们使用 CommonJS 语法导入了两个 Electron 模块：

```ts
const { app, BrowserWindow } = require("electron");
```

- app，这个模块控制着您应用程序的事件生命周期。
- BrowserWindow，这个模块创建和管理 app 的窗口。

::: details 类型化
为了在编写ts时有类型检查，可以从electron/main导入。

```ts
const { app, BrowserWindow } = require("electron/main");
```

:::

将可复用的函数写入实例化窗口

#### 2. 创建函数

createWindow()函数将页面加载到新的BrowserWindow实例中。

```ts
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  win.loadFile("index.html");
};
```

### 3. 调用函数

在应用准备就绪时调用函数。

```ts
app.whenReady().then(() => {
  createWindow();
});
```
