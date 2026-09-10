# WebSocket 实时通信

## 什么是 WebSocket？

**WebSocket** 是一种网络通信协议，它在**单个 TCP 连接**上实现**全双工通信**。

简单来说，普通的 HTTP 请求是"一问一答"——客户端问了，服务器才能答。而 WebSocket 建立连接后，客户端和服务器可以**随时互发消息**，就像打电话一样。


| 协议 | 通信模式 | 特点 |
|------|----------|------|
| HTTP | 请求-响应（半双工） | 客户端主动，服务器被动 |
| WebSocket | 全双工 | 双方随时可发消息，实时性高 |
| 轮询 | 定时发 HTTP 请求 | 伪实时，浪费资源 |

## 为什么需要 WebSocket？

### 传统 HTTP 的局限

假设你要做一个**在线聊天室**，用 HTTP 怎么做？

1. 客户端每隔 1 秒发一个请求问"有新消息吗？"（**轮询**）
2. 99% 的请求回复都是"没有"
3. 带宽浪费、服务器压力大、延迟高

### WebSocket 的优势

- **实时性** — 消息到达延迟毫秒级
- **低开销** — 一次握手，持久连接，头部仅 2~6 字节
- **双向通信** — 服务器可主动推送
- **适用场景** — 聊天室、协作编辑、股票行情、游戏、通知推送

---

## WebSocket 工作原理

<ContentToggle>

<template #simple>

WebSocket 的生命周期很简单，分四步走：

1. **握手** — 客户端发一个特殊的 HTTP 请求，告诉服务器"我要升级成 WebSocket"，服务器同意后连接建立
2. **传数据** — 双方用紧凑的**二进制帧**互发消息，帧头只有 2~6 字节，远比 HTTP 头轻量
3. **心跳保活** — 定期发 Ping/Pong 帧确认对方还活着，防止长时间没数据被路由器断开
4. **关闭连接** — 任一方发关闭帧，附带状态码说明原因，优雅断开

```
  客户端                          服务器
    │                              │
    │──── HTTP Upgrade 请求 ──────→│  🔗 握手
    │←─── 101 Switching Protocols ─│
    │                              │
    │── 发消息（数据帧）──────────→│  💬 聊天
    │←─ 回消息（数据帧）───────────│
    │                              │
    │←────── Ping 帧 ────────────│  💓 心跳
    │────── Pong 帧 ────────────→│
    │                              │
    │────── Close 帧 ────────────→│  🔌 关闭
    │←───── Close 帧 ─────────────│
```

</template>

<template #deep>

WebSocket 的生命周期分为四个阶段：**握手 → 数据传输 → 心跳保活 → 关闭连接**。

```
  客户端                          服务器
    │                              │
    │──── HTTP Upgrade 请求 ──────→│  🔗 阶段一：握手
    │←─── 101 Switching Protocols ─│
    │                              │
    ┊        循环：双向数据传输      ┊  💬 阶段二：传数据
    │── 数据帧（masked）──────────→│
    │←─ 数据帧（unmasked）─────────│
    ┊                              ┊
    ┊        循环：心跳保活         ┊  💓 阶段三：心跳
    │←────── Ping 帧 ────────────│
    │────── Pong 帧 ────────────→│
    ┊                              ┊
    │                              │
    │────── Close 帧 ────────────→│  🔌 阶段四：关闭
    │←───── Close 帧 ─────────────│
```

---

### 1. 握手 —— 从 HTTP "升级"到 WebSocket

WebSocket 巧妙的利用了 HTTP 协议本身的**升级机制**，复用了 80（ws://）和 443（wss://）端口，不需要单独开防火墙。

#### 客户端发起升级请求

浏览器在发起 WebSocket 连接时，发送一个特殊的 HTTP GET 请求：

```http
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket          ← 告诉服务器：我要升级协议
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==   ← 随机生成的 base64 密钥
Sec-WebSocket-Version: 13
```

几个关键头的作用：

| 请求头 | 作用 |
|--------|------|
| `Upgrade: websocket` | 声明要升级到 WebSocket 协议 |
| `Connection: Upgrade` | 告诉中间代理这是一次升级请求 |
| `Sec-WebSocket-Key` | 客户端随机生成的 16 字节 base64 串，用于**安全校验** |
| `Sec-WebSocket-Version` | WebSocket 协议版本，目前固定为 13 |

#### 服务器响应 —— 握手完成

服务器收到请求后，用固定算法算出 `Sec-WebSocket-Accept` 并返回：

```http
HTTP/1.1 101 Switching Protocols    ← 101 表示协议切换成功
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

> **`Sec-WebSocket-Accept` 是如何算出来的？**
>
> 服务器将客户端发来的 `Sec-WebSocket-Key` 拼接一个固定的魔法字符串 `258EAFA5-E914-47DA-95CA-C5AB0DC85B11`，做 SHA-1 哈希后再 base64 编码。
>
> 这个设计确保了：**服务器确实理解 WebSocket 协议**（而不是某个中间代理胡乱返回 101），防止跨协议攻击。

#### 为什么要有这个握手？

HTTP 和 WebSocket 都跑在 80/443 端口上。假如没有这个基于 Key/Accept 的校验，一个普通的 HTTP 服务器可能被诱导返回 101，连接被错误升级。**魔术字符串**的存在确保了这是双方协商好的协议切换。

---

### 2. 数据帧 —— 消息如何在链路上传输

握手完成后，TCP 连接不再走 HTTP，双方直接用**二进制帧**通信。每个帧的结构非常紧凑：

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-------+-+-------------+-------------------------------+
|F|R|R|R| opcode|M| Payload len |     Extended payload length    |
|I|S|S|S|  (4)  |A|     (7)     |          (16/64)              |
|N|V|V|V|       |S|             |   (if payload len==126/127)    |
| |1|2|3|       |K|             |                               |
+-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
|   Extended payload length continued (if payload len == 127)    |
+ - - - - - - - - - - - - - - - +-------------------------------+
|                                |  Masking-key (if MASK=1)      |
+--------------------------------+-------------------------------+
|  Masking-key (continued)       |       Payload Data           |
+--------------------------------+ - - - - - - - - - - - - - - - +
:                     Payload Data continued ...                 :
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
|                     Payload Data continued ...                 |
+---------------------------------------------------------------+
```

#### 关键字段说明

| 字段 | 大小 | 说明 |
|------|------|------|
| **FIN** | 1 bit | 是否最后一帧（大消息可以分片发送） |
| **RSV1/2/3** | 3 bits | 扩展预留位，通常为 0 |
| **opcode** | 4 bits | 帧类型，见下表 |
| **MASK** | 1 bit | 是否掩码。**客户端→服务器必须为 1**，服务器→客户端为 0 |
| **Payload len** | 7 bits | 载荷长度（≤125 直接存，126 用 2 字节扩展，127 用 8 字节） |
| **Masking-key** | 0 或 4 字节 | 客户端发消息时必带，用于掩码解码 |
| **Payload Data** | 变长 | 实际传输的数据 |

#### opcode 帧类型

| opcode | 含义 | 说明 |
|--------|------|------|
| `0x0` | 延续帧 | 分片消息的后续部分 |
| `0x1` | 文本帧 | UTF-8 文本数据 |
| `0x2` | 二进制帧 | 图片、音频等原始二进制数据 |
| `0x8` | 关闭帧 | 关闭连接 |
| `0x9` | Ping 帧 | 心跳检测 |
| `0xA` | Pong 帧 | 心跳响应 |

#### 掩码（Masking）—— 为什么客户端消息必须掩码？

你可能会注意到：**客户端发给服务器的帧必须"掩码"**，而服务器发给客户端的不需要。

这是一个著名的安全设计。2011 年，安全研究人员发现：如果客户端不掩码，攻击者可以利用浏览器发送的 WebSocket 数据，**伪造 HTTP 请求**去攻击内网的代理服务器（缓存投毒攻击）。

掩码机制：客户端每发一帧，随机生成 4 字节的 `Masking-key`，将载荷每个字节与 key 做 XOR 运算。服务器收到后按同样的 key 解码还原。这一设计彻底阻断了攻击链。

#### 帧大小为什么这么灵活？

Payload len 用了**变长编码**：
- 小于 126 字节 → 直接存（常见文本消息够用）
- 126~65535 → 用额外 2 字节存储
- 超过 65535 → 用额外 8 字节存储（最大 2^63，基本无限）

大多数聊天消息都在 125 字节以内，帧头仅 **2 字节**（1 字节 FIN+opcode+mask，1 字节 MASK+len）加上 4 字节掩码密钥，总共 **6 字节**。对比 HTTP 请求头动辄几百甚至上千字节，开销小了一个数量级。

---

### 3. 心跳 —— 保持连接活着

TCP 连接如果长时间不传数据，沿途的路由器、NAT、防火墙可能会**丢弃这条"沉默"的连接**。WebSocket 设计了 Ping/Pong 帧来解决：

```
  客户端                          服务器
    ┊        每 30 秒              ┊
    │←────── Ping 帧 ────────────│  "你还活着吗？"
    │────── Pong 帧 ────────────→│  "活着呢！"
    ┊                              ┊
                    超时未收到 Pong → 判定断开 ❌
```

- **Ping**（opcode `0x9`）—— 一端发出，检测对方是否存活
- **Pong**（opcode `0xA`）—— 收到 Ping 后立即回应

浏览器端的原生 `WebSocket` API 会**自动回复 Pong**，开发者无需关心。服务器端需要自己实现 Ping 发送逻辑（Socket.IO 内置了，无需手动写）。

---

### 4. 关闭 —— 优雅地说再见

任意一端都可以发起关闭。关闭帧的载荷前 2 个字节是**状态码**，后面可跟一段可读的关闭原因：

```
字节 0-1:  状态码（如 1000 = 正常关闭）
字节 2+:   关闭原因（UTF-8 文本，可选）
```

常见关闭状态码：

| 状态码 | 含义 |
|--------|------|
| `1000` | 正常关闭 |
| `1001` | 端点离开（页面跳转、浏览器关闭） |
| `1006` | 连接异常断开（网络故障等，浏览器内部使用） |
| `1008` | 协议错误 |
| `1009` | 消息过大 |
| `1011` | 服务器内部错误 |

---

> **一句话总结**：用 HTTP 完成一次握手，之后把 TCP 连接升级为轻量级全双工通道，用紧凑的帧结构进行高效双向通信。

</template>

</ContentToggle>


## 客户端 WebSocket API

浏览器原生支持 WebSocket，无需安装任何库：

### 创建连接

```js
// 创建 WebSocket 连接
const ws = new WebSocket('ws://localhost:3000/chat')

// 连接成功
ws.onopen = () => {
  console.log('连接成功！')
  ws.send('大家好，我来了！')
}

// 接收消息
ws.onmessage = (event) => {
  console.log('收到消息：', event.data)
  // 如果服务器发的是 JSON
  const msg = JSON.parse(event.data)
}

// 连接关闭
ws.onclose = () => {
  console.log('连接已断开')
}

// 连接错误
ws.onerror = (error) => {
  console.error('连接出错：', error)
}
```

### 发送消息

```js
// 发送纯文本
ws.send('Hello!')

// 发送 JSON（需要先序列化）
ws.send(JSON.stringify({
  type: 'chat',
  username: '小明',
  content: '大家好！'
}))
```

### 关闭连接

```js
// code: 状态码（1000 表示正常关闭）
// reason: 关闭原因说明
ws.close(1000, '用户离开')
```

## Socket.IO vs 原生 WebSocket

很多项目不直接用原生 WebSocket，而是用 **Socket.IO**。它们的关系就像 Vue 和 JavaScript：

| 对比 | 原生 WebSocket | Socket.IO |
|------|---------------|-----------|
| 浏览器支持 | 现代浏览器全部支持 | 需要引入 `socket.io-client` |
| 自动重连 | ❌ 需要手动实现 | ✅ 内置 |
| 房间/命名空间 | ❌ 需要自己封装 | ✅ 内置 `room` 概念 |
| 降级兼容 | 不支持旧浏览器 | 自动降级到 HTTP 长轮询 |
| 消息确认 | ❌ | ✅ 支持 ACK |
| 框架集成 | 需要自己封装 | NestJS 有 `@nestjs/websockets` 专用模块 |

### "Socket.IO 不是 WebSocket 实现"到底什么意思？

Socket.IO 官网有一句反复强调的话：**Socket.IO is NOT a WebSocket implementation**。

很多人不理解——"Socket.IO 底层不就是 WebSocket 吗？怎么说不是呢？"

#### 一句话说清

**WebSocket 是协议，Socket.IO 是框架。** 就像 HTTP 是协议，Express 是框架——你不能说 "Express 是 HTTP 的实现"。Go 的标准库 `net/http` 才是 HTTP 的实现，就像浏览器内置的 `new WebSocket()` 才是 WebSocket 的实现。

#### 为什么不能混用？

Socket.IO 在 WebSocket 外面包了一层**自己的协议（Engine.IO）**。它把消息编码成特定格式的 JSON 包来传输：

```
Socket.IO 消息在 WebSocket 帧里长这样：
42["chat message",{"text":"你好"}]

而不是：
你好
```

这就导致了一个很实际的后果：**客户端和服务端必须都用 Socket.IO**。

```
浏览器 new WebSocket()  ──→  ❌  ──→  Socket.IO 服务器
Socket.IO 客户端         ──→  ❌  ──→  原生 WebSocket 服务器
Socket.IO 客户端         ──→  ✅  ──→  Socket.IO 服务器
```

你能用 `curl` 发 HTTP 请求调 Express 接口，但你没法用浏览器原生 `WebSocket` 连 Socket.IO 服务器——协议不互通。

#### 另一个证据：降级

如果网络环境差到连 WebSocket 都建立不了，Socket.IO 会自动切到 HTTP 长轮询，此时跟 WebSocket 协议**完全无关**。一个"WebSocket 实现"做不到这一点。

> **一句话**：Socket.IO 把 WebSocket 当传输工具用，但它自己是一套完整的实时通信框架，不是 WebSocket 协议本身。

### Node.js 服务端（Socket.IO）

```js
import { Server } from 'socket.io'

const io = new Server(3000, {
  cors: { origin: '*' }
})

io.on('connection', (socket) => {
  console.log('用户连接:', socket.id)

  // 加入房间
  socket.join('chat-room')

  // 监听客户端消息
  socket.on('sendMessage', (data) => {
    // 广播给房间内所有人（包括自己）
    io.to('chat-room').emit('newMessage', {
      username: data.username,
      content: data.content,
      timestamp: Date.now()
    })
  })

  // 断开连接
  socket.on('disconnect', () => {
    console.log('用户断开:', socket.id)
  })
})
```

### 客户端（Socket.IO）

```js
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000')

socket.on('connect', () => {
  console.log('已连接')
})

// 接收新消息
socket.on('newMessage', (msg) => {
  console.log(`${msg.username}: ${msg.content}`)
})

// 发送消息
socket.emit('sendMessage', {
  username: '小明',
  content: '你好！'
})
```

---

## 常见问题

### WebSocket 连接失败怎么办？

1. 检查服务器是否启动了 WebSocket 服务
2. 检查防火墙是否放行对应端口
3. 检查是否使用正确的协议：`ws://`（非加密）或 `wss://`（加密，等同 HTTPS）
4. 如果是反向代理（Nginx），需要额外配置 WebSocket 支持

### 如何保证消息不丢失？

- WebSocket 基于 TCP，传输层保证数据有序到达
- 应用层可以加**消息确认机制**（ACK）
- 断线后需要**补发历史消息**

### 心跳机制

长时间不通信，连接可能被中间设备断开。需要定期发"心跳包"：

```js
// 客户端每 30 秒发一次 ping
setInterval(() => {
  ws.send('ping')
}, 30000)
```

::: tip 提示
Socket.IO 内置了心跳机制，无需手动实现。
:::


## WebSocket 实战：在线聊天室

接下来我们基于当前项目（NestJS + Vue 3），用 **Socket.IO** 从零实现一个在线聊天室。

### 第一步，建立连接
#### 服务端

```bash
cd server
npm i @nestjs/websockets @nestjs/platform-socket.io
```

| 包 | 作用 |
|---|------|
| `@nestjs/websockets` | NestJS 的 WebSocket 模块，提供 `@WebSocketGateway()` 等装饰器 |
| `@nestjs/platform-socket.io` | Socket.IO 的 NestJS 适配器，让 NestJS 和 Socket.IO 对接 |

---

NestJS 中用 **Gateway** 来处理 WebSocket 连接，概念上类似 HTTP 的 Controller。

创建 `server/src/modules/chat/chat.gateway.ts`：

```ts
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  handleConnection(client: Socket) {
    console.log('有人连上来了，id:', client.id);
    console.log('用户名:', client.handshake.query.username);
  }

  handleDisconnect(client: Socket) {
    console.log('有人断开了，id:', client.id);
    console.log('用户名:', client.handshake.query.username);
  }
}

```

NestJS 不是靠方法名来识别代码的，而是靠**装饰器和接口**。不加这些标记，方法写得再好也不会被调用。

**`@WebSocketGateway()` — 类装饰器**

告诉 NestJS："这个类是一个 WebSocket 入口，请按 Socket.IO 的方式处理它"。

```ts
@WebSocketGateway({ cors: { origin: '*' } })  // ← 没有这行，NestJS 不认识这个类
export class ChatGateway { ... }
```

不加它，NestJS 启动时直接跳过这个类，不会为它创建 WebSocket 服务。

---

**`implements OnGatewayConnection, OnGatewayDisconnect` — 接口**

告诉 NestJS："这个类里有 `handleConnection` 和 `handleDisconnect` 方法，请在连接/断开时调用它们"。

```ts
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  handleConnection(client: Socket) { ... }   // ← 有人连上来，NestJS 自动调
  handleDisconnect(client: Socket) { ... }   // ← 有人断开，NestJS 自动调
}
```

如果不 `implements` 这两个接口，NestJS 不知道你有这两个方法，即使方法名完全一样也不会调用。TypeScript 的 `implements` 在这里被 NestJS 用作**运行时标识**。

然后，创建 `server/src/modules/chat/chat.module.ts`：

```ts
import { Module } from '@nestjs/common'
import { ChatGateway } from './chat.gateway'

@Module({
  providers: [ChatGateway],
})
export class ChatModule {}
```

然后在 `app.module.ts` 中注册：

```ts
import { ChatModule } from './modules/chat/chat.module'
// ... 在 imports 数组中添加 ChatModule
```

---

#### 客户端

```bash
cd web
npm i socket.io-client
```

---


用 Pinia 管理聊天状态。创建 `web/src/stores/chat.ts`：

```ts
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { io, type Socket } from 'socket.io-client'

export const useChatStore = defineStore('chat', () => {
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)

  // 连上服务器
  function connect(username: string) {
    socket.value = io({ query: { username } })
    socket.value.on('connect', () => {
      console.log('连上了！socket id:', socket.value?.id)
      isConnected.value = true
    })
    socket.value.on('disconnect', () => {
      console.log('断开了')
      isConnected.value = false
    })
  }

  function disconnect() {
    socket.value?.disconnect()
  }

  return { socket, isConnected, connect, disconnect }
})

```

**`socket.value` 是什么？**

```ts
socket.value = io({ query: { username } }) // io() 返回一个 Socket 对象，塞进去
```

`io()` 是工厂函数，调用它返回一个**普通的 JavaScript 对象**，这个对象就是你和服务器之间的那条"电话线"：

```ts
// io() 返回的对象长这样：
{
  id: 'shNdjAzA7wNlizgUAAAB',        // 属性：连接唯一标识
  on: function(事件名, 回调) {},        // 方法：注册监听（接听）
  emit: function(事件名, 数据) {},      // 方法：发送消息（说话）
  disconnect: function() {},            // 方法：断开连接（挂电话）
}

// 用法
socket.value.on('connect', () => { ... })   // 连上时执行
socket.value.on('disconnect', () => { ... })   // 断开时执行
socket.value.emit('sendMessage', { content })  // 发送消息
socket.value.disconnect()                      // 主动断开
```

`.on()` 跟浏览器原生 `addEventListener` 完全一致，只是监听的是网络事件而非 DOM 事件。

接着创建 `web/src/views/chat/ChatView.vue`：

```html
<script setup lang="ts">
import { ref } from 'vue'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()
const myName = ref<string>('')
</script>

<template>
  <div>
    <n-form-item label="请输入名字">
      <n-input v-model:value="myName"></n-input>
    </n-form-item>

    <n-button @click="chatStore.connect(myName)">点我连接</n-button>
    <n-button @click="chatStore.disconnect()">点我断开连接</n-button>
  </div>
</template>

```

输入名字，点击连接，
``` bash
# 前端输出
连上了！socket id: K5BhZXelNrdk-J_wAAAx
# 后端输出
有人连上来了，id: K5BhZXelNrdk-J_wAAAx
用户名: 我是超级大帅哥！

```
点击断开连接，
``` bash
# 前端输出
断开了
# 后端输出
有人断开了，id: K5BhZXelNrdk-J_wAAAx
用户名: 我是超级大帅哥！
```
### 事件流程总结

```
客户端                               服务器
  │──── connect (query: username) ──→│  handleConnection()
  │                                  │
  │──── disconnect ─────────────────→│  handleDisconnect()
```

至此，一个最基本的websocket连接就完成了。


### 第二步，客户端向服务端发送消息

#### 服务端

```ts{5-7,23-30}
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  handleConnection(client: Socket) {
    console.log('有人连上来了，id:', client.id);
    console.log('用户名:', client.handshake.query.username);
  }

  handleDisconnect(client: Socket) {
    console.log('有人断开了，id:', client.id);
    console.log('用户名:', client.handshake.query.username);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @ConnectedSocket() client: Socket, // 明确告诉 NestJS "这是 socket"
    @MessageBody() data: { content: string }, // 明确告诉 NestJS "这是消息体"
  ): void {
    const username = (client.handshake.query.username as string) || '匿名用户';
    console.log(`收到 ${username} 的消息: ${data.content}`);
  }
}
```

这三个装饰器各自的作用：

**`@SubscribeMessage('事件名')` — 方法装饰器**

告诉 NestJS：前端发来 `'sendMessage'` 事件时，调用下面这个方法。

```ts
// ✅ 有 @SubscribeMessage
@SubscribeMessage('sendMessage')
handleMessage(...) { }   // 前端 emit('sendMessage', ...) → 这个方法会被调用

// ❌ 没有 @SubscribeMessage
handleMessage(...) { }   // 这就是个普通方法，NestJS 永远不会调它
```

**`@ConnectedSocket()` — 参数装饰器**

告诉 NestJS：方法第一个参数是当前连接的 `socket` 对象（谁发的消息）。

```ts
// ✅ 有 @ConnectedSocket
handleMessage(@ConnectedSocket() client: Socket, data) {
  console.log(client.handshake.query.username)  // ✅ 能拿到发送者是谁
}

// ❌ 没有 @ConnectedSocket，但参数位置固定
handleMessage(client: Socket, data) {
  console.log(client.handshake.query.username)  // ✅ 一样能用，NestJS 默认第一个参数就是 socket
}
```

**`@MessageBody()` — 参数装饰器**

告诉 NestJS：这个参数是前端发来的消息体数据。

```ts
// ✅ 有 @MessageBody
handleMessage(client, @MessageBody() data: { content: string }) {
  console.log(data.content)  // ✅ 拿到消息内容
}

// ❌ 没有 @MessageBody，参数位置固定
handleMessage(client, data: { content: string }) {
  console.log(data.content)  // ✅ 一样能用，NestJS 第二个参数就是消息体
}
```

> **总结**：NestJS WebSocket 的参数顺序是固定的——第 1 个是 socket，第 2 个是数据。不加 `@ConnectedSocket` 和 `@MessageBody` 也能正常工作，加了只是更明确地告诉 NestJS（和你自己）每个参数是什么。但 `@SubscribeMessage` **必须加**，不然 NestJS 不知道哪个方法处理哪个事件。

#### 客户端

```ts{22-26}
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { io, type Socket } from 'socket.io-client'

export const useChatStore = defineStore('chat', () => {
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)

  // 连上服务器
  function connect(username: string) {
    socket.value = io({ query: { username } })
    socket.value.on('connect', () => {
      console.log('连上了！socket id:', socket.value?.id)
      isConnected.value = true
    })
    socket.value.on('disconnect', () => {
      console.log('断开了')
      isConnected.value = false
    })
  }

  // 发消息给服务器
  function sendMessage(content: string) {
    console.log('发送消息:', content)
    socket.value?.emit('sendMessage', { content })
  }

  function disconnect() {
    socket.value?.disconnect()
  }

  return { socket, isConnected, connect, sendMessage, disconnect }
})
```
> 这就不用演示了吧

### 第三步，服务端把消息广播给所有人

刚才只是服务端"收到"了消息，但只有服务器自己知道。真正聊天需要把消息**推给所有在线的人**。

#### 服务端

用到两个新东西：

- `@WebSocketServer()` — 装饰器，注入 Socket.IO 的 `Server` 实例
- `server.emit('事件名', 数据)` — 给所有连接的客户端群发消息

```ts{8,15-16,36-41}
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  WebSocketServer,        // ← 新增
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';  // ← 新增 Server 类型

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server!: Server;        // ← 新增：广播喇叭

  handleConnection(client: Socket) {
    console.log('有人连上来了，id:', client.id);
    console.log('用户名:', client.handshake.query.username);
  }

  handleDisconnect(client: Socket) {
    console.log('有人断开了，id:', client.id);
    console.log('用户名:', client.handshake.query.username);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @ConnectedSocket() client: Socket, // 明确告诉 NestJS "这是 socket"
    @MessageBody() data: { content: string }, // 明确告诉 NestJS "这是消息体"
  ): void {
    const username = (client.handshake.query.username as string) || '匿名用户';
    console.log(`收到 ${username} 的消息: ${data.content}`);

    // 广播给所有人（包括发送者自己）
    this.server.emit('newMessage', {
      username,
      content: data.content,
      timestamp: Date.now(),
    });
  }
}
```

**`@WebSocketServer() server` 是什么？**

服务器维护着所有客户端的连接，`server` 就是操作这些连接的"遥控器"。没用它之前，消息进来就停了；有了它，消息进来→广播出去→聊天室所有人看到。

**`!` 是什么？**

```ts
server!: Server;
```

TypeScript 看到 `server` 没赋值就报错。但 NestJS 会在运行时通过 `@WebSocketServer()` 自动把值塞进去。加 `!` 就是告诉 TypeScript："我知道，别报错，运行时会有的"。

#### 客户端

客户端需要监听服务器广播的 `newMessage` 事件，把消息存到列表里显示。

```ts{5-10,29-33}
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { io, type Socket } from 'socket.io-client'

// 消息的类型
export interface ChatMessage {
  username: string
  content: string
  timestamp: number
}

export const useChatStore = defineStore('chat', () => {
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)
  const messages = ref<ChatMessage[]>([])  // ← 消息列表

  // 连上服务器
  function connect(username: string) {
    socket.value = io({ query: { username } })
    socket.value.on('connect', () => {
      console.log('连上了！socket id:', socket.value?.id)
      isConnected.value = true
    })
    socket.value.on('disconnect', () => {
      console.log('断开了')
      isConnected.value = false
    })

    // 收到服务器广播的消息 → 加到列表里
    socket.value.on('newMessage', (msg: ChatMessage) => {
      messages.value.push(msg)
    })
  }

  // 发消息给服务器
  function sendMessage(content: string) {
    console.log('发送消息:', content)
    socket.value?.emit('sendMessage', { content })
  }

  function disconnect() {
    socket.value?.disconnect()
  }

  return { socket, isConnected, messages, connect, sendMessage, disconnect }
})
```

页面加一个消息展示区域：

```html
<!-- 消息列表 -->
<div style="height:200px; overflow-y:auto; border:1px solid #ccc; padding:8px;">
  <div v-for="(msg, i) in chatStore.messages" :key="i">
    <strong>{{ msg.username }}</strong>: {{ msg.content }}
  </div>
</div>
```

#### 效果

```
张三打开页面 → 输入名字 → 点连接
李四打开页面 → 输入名字 → 点连接

张三输入"你好" → 点发送
  → 张三页面显示: 张三: 你好
  → 李四页面显示: 张三: 你好
  → 服务器打印: 收到 张三 的消息: 你好
```

消息路线：

```
张三发消息 ──→ 服务器收到 ──→ server.emit() 群发 ──→ 所有人收到并显示
```

至此，一个能真正聊天的聊天室就完成了。

---

### 第四步，完善聊天室体验

加上在线人数、上线/离线通知、气泡样式、时间显示、Enter 发送、自动滚动。

#### 服务端

用 `Map` 记录在线用户，连接/断开时广播通知。

```ts{13,17-20,27-30}
// ... 前面代码不变

  @WebSocketServer()
  server!: Server;

  // 在线用户：id → 用户名
  private onlineUsers: Map<string, string> = new Map();

  handleConnection(client: Socket) {
    console.log('有人连上来了，id:', client.id);
    console.log('用户名:', client.handshake.query.username);

    const username = (client.handshake.query.username as string) || '匿名用户';
    this.onlineUsers.set(client.id, username);
    this.server.emit('userJoined', { username, onlineCount: this.onlineUsers.size });
  }

  handleDisconnect(client: Socket) {
    console.log('有人断开了，id:', client.id);
    console.log('用户名:', client.handshake.query.username);

    const username = this.onlineUsers.get(client.id) || '匿名用户';
    this.onlineUsers.delete(client.id);
    this.server.emit('userLeft', { username, onlineCount: this.onlineUsers.size });
  }
```

#### 客户端 store

加 `onlineCount` 和上下线监听。

```ts{3-4,9-11}
  const messages = ref<ChatMessage[]>([])
  const onlineCount = ref(0)

  // ... connect 函数里面加：
  socket.value.on('userJoined', (data: { onlineCount: number }) => {
    onlineCount.value = data.onlineCount
  })
  socket.value.on('userLeft', (data: { onlineCount: number }) => {
    onlineCount.value = data.onlineCount
  })
```

#### 客户端界面

- 已连接时显示「聊天室 | N 人在线」顶栏 + 离开按钮
- 消息气泡：自己的蓝色靠右，别人的灰色靠左
- 每条消息显示发送者和时间
- Enter 发送，新消息自动滚到底部

完整代码见 `web/src/views/chat/ChatView.vue`。

#### 效果

```
张三进入 → 所有人看到 "张三 加入聊天室"
李四进入 → 所有人看到 "李四 加入聊天室"
在线人数: 2

张三发 "你好" →
  张三（蓝色气泡，右侧）: 张三 · 14:30  你好
  李四（灰色气泡，左侧）: 张三 · 14:30  你好
```