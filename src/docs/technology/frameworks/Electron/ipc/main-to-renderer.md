# 主进程到渲染进程

进程间通信（IPC，Inter-Process Communication）是 Electron 里绕不开的一环：主进程管窗口和系统能力，渲染进程管页面，两边**不可互换**，想让它们交换数据就只能走 IPC。

Electron 提供了两个模块来通信：

- `ipcMain` —— 在主进程使用，负责监听
- `ipcRenderer` —— 在渲染进程使用，负责发送（也能监听）


## 实战：构建一个由原生操作系统菜单控制的数字计数器

场景：主进程里某个事件触发了（这里用定时器模拟），要把内容显示到页面上。

### 1. 使用 webContents 模块发送消息

``` ts {12-26}
// main.ts

function createWindow () {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        {
          click: () => mainWindow.webContents.send('update-counter', 1),
          label: 'Increment'
        },
        {
          click: () => mainWindow.webContents.send('update-counter', -1),
          label: 'Decrement'
        }
      ]
    }
  ])
  Menu.setApplicationMenu(menu)

  mainWindow.loadFile('index.html')
}

```

页面上面的菜单栏会出现两个按钮，一个是Increment，一个是Decrement，点击之后会发送事件和对应参数。
例如，点击Increment之后，会发送事件 `update-counter`，然后携带参数 `1`。

### 2. preload 暴露订阅函数

```js
// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateCounter: (callback) => ipcRenderer.on('update-counter', (_event, value) => callback(value))
})
```
在这一步中，通过`contextBridge`对象的`exposeInMainWorld`函数，将`electronAPI`挂到了渲染进程的`window`对象上。这个`electronAPI`身上有一个函数，这个函数名叫`onUpdateCounter`，接收一个参数`callback`。调用函数，会在渲染进程上开启订阅`update=-counter`事件，事件回调使用`callback`。

### 3. 渲染进程订阅

``` ts
// render.ts
const counter = document.getElementById('counter')

window.electronAPI.onUpdateCounter((value) => {
  const oldValue = Number(counter.innerText)
  const newValue = oldValue + value
  counter.innerText = newValue.toString()
})

```

然后在渲染进程上使用这个函数注册订阅即可。
