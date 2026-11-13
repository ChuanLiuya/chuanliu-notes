# TypeScript SDK 使用

::: tip 版本说明
官方 TypeScript SDK 早期是一个包 `@modelcontextprotocol/sdk`，后来重构为按模块拆分的多个包。本文基于**当前最新官方用法**，服务端、客户端是各自独立的包。
:::

## 认识官方包

| 包名 | 作用 |
| --- | --- |
| `@modelcontextprotocol/server` | 写 MCP **服务端**（`McpServer`） |
| `@modelcontextprotocol/client` | 写 MCP **客户端**（`Client`） |
| `zod` | 声明工具参数、提示词参数的校验 Schema（SDK 靠它生成 JSON Schema） |
| `@modelcontextprotocol/*` 下的 `/stdio` 子路径 | 各自的 stdio 传输实现 |

只需 `McpServer` 注册好**工具 / 资源 / 提示词**，再用一个传输把它跑起来，就是一个完整的 MCP 服务器。

## 准备工程

```bash
# 1. 初始化
mkdir my-mcp-server
cd my-mcp-server
npm init -y

# 2. 安装依赖（服务端 + 客户端 + 参数校验）
npm install @modelcontextprotocol/server @modelcontextprotocol/client zod

# 3. 开发依赖：tsx 用于直接跑 ts，typescript 用于编译
npm install -D typescript tsx @types/node
```

`package.json` 里加上 `"type": "module"`（新版 SDK 走 ESM）：

```json
{
  "type": "module"
}
```

`tsconfig.json` 参考官方推荐配置：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "types": ["node"],
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

## 服务端：注册工具 / 资源 / 提示词

新建 `src/index.ts`，先创建一个服务器实例：

```ts
import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

const server = new McpServer({
  name: "my-first-server", // 服务名
  version: "1.0.0",
});
```

### 注册工具（Tools）

用 `server.registerTool(名字, 配置, 处理函数)`。工具参数写在 `inputSchema` 里，SDK 会自动把它转成 JSON Schema 广播给客户端：

```ts
server.registerTool(
  "greet",
  {
    description: "跟指定的人打招呼",
    inputSchema: z.object({
      name: z.string().describe("对方的名字"),
    }),
  },
  // 第一个参数是校验过的入参，结构由 inputSchema 决定
  async ({ name }) => {
    return {
      content: [{ type: "text", text: `你好，${name}！` }],
    };
  },
);
```

### 注册资源（Resources）

用 `server.registerResource(名字, uri, 配置, 读取函数)`。资源必须有唯一 `uri`，读取函数返回 `contents`：

```ts
server.registerResource(
  "about",
  "my-server://about",
  {
    title: "关于本服务器",
    mimeType: "text/plain",
  },
  async (uri) => ({
    contents: [{ uri: uri.href, text: "这个服务器用来演示如何写 MCP。" }],
  }),
);
```

::: tip
上面的例子是固定 `uri` 的静态资源。如果是「根据参数动态取数据」的资源（比如按 id 读一条笔记），注册时传一个 `ResourceTemplate`，就能支持 `notes://{id}` 这种带变量的 URI 模板。
:::

### 注册提示词（Prompts）

用 `server.registerPrompt(名字, 配置, 生成函数)`。生成函数返回一组消息，作为给 AI 的「预设指令」：

```ts
server.registerPrompt(
  "translate",
  {
    title: "翻译",
    description: "把一段文本翻译成指定语言",
    argsSchema: z.object({
      text: z.string().describe("要翻译的文本"),
      target: z.string().describe("目标语言，如：中文"),
    }),
  },
  async ({ text, target }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `请把下面内容翻译成${target}：\n\n${text}`,
        },
      },
    ],
  }),
);
```

### 用 stdio 把服务器跑起来

最后连接一个传输并等待消息。MCP 服务端最常见的传输是 **stdio**（通过标准输入输出通信，Claude 桌面端、各种 CLI 客户端都靠它拉起服务）：

```ts
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";

// ……上面注册工具/资源/提示词的代码……

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport); // 连接并开始监听 JSON-RPC 消息
  console.error("my-first-server 已通过 stdio 运行");
}

main().catch((err) => {
  console.error("启动失败：", err);
  process.exit(1);
});
```

::: warning 关键坑
stdio 服务端**绝不能往 stdout 打印东西**（包括 `console.log`），stdout 是协议消息的通道，一旦打印会直接把 JSON-RPC 消息搞坏。需要打日志请用 `console.error`（写 stderr）或日志库。
:::

运行它：

```bash
npx tsx src/index.ts
```

看到 `my-first-server 已通过 stdio 运行`（走 stderr）就说明服务端已就绪，正在等待客户端连接。

::: tip 更省事的写法
SDK 还提供了 `serveStdio`，只要传一个「返回服务器实例的工厂函数」即可，无需手动 `connect`：

```ts
import { serveStdio } from "@modelcontextprotocol/server/stdio";

serveStdio(() => {
  const server = new McpServer({ name: "my-first-server", version: "1.0.0" });
  // ……注册工具/资源/提示词……
  return server;
});
```
:::

## 客户端：连接并调用

服务端写好后，用官方 `@modelcontextprotocol/client` 包写一个最小客户端来验证。新建 `src/client.ts`：

```ts
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

async function main() {
  // 1. 创建客户端实例
  const client = new Client({ name: "my-first-client", version: "1.0.0" });

  // 2. 用 stdio 传输拉起服务端进程（connect 内部会 spawn 这个命令并完成握手）
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["tsx", "src/index.ts"],
  });
  await client.connect(transport);

  // 3. 列出服务端注册的工具
  const { tools } = await client.listTools();
  console.log(tools.map((t) => `${t.name} — ${t.description}`));

  // 4. 调用工具
  const result = await client.callTool({
    name: "greet",
    arguments: { name: "小明" },
  });
  for (const block of result.content) {
    if (block.type === "text") console.log(block.text);
  }

  // 5. 读取资源
  const { contents } = await client.readResource({ uri: "my-server://about" });
  console.log(contents);

  // 6. 关闭连接（会结束它拉起的服务端进程）
  await client.close();
}

main().catch((err) => {
  console.error("客户端出错：", err);
  process.exit(1);
});
```

在**工程根目录**运行：

```bash
npx tsx src/client.ts
```

即可看到：服务端 banner、工具列表、打招呼结果、资源内容，随后正常退出。

## 常见问题

**参数校验失败会怎样？**

客户端传入的参数不满足 `inputSchema` 时，SDK 会直接拒绝，返回一个 `isError: true` 的普通结果，不会真的进入处理函数，也不会抛异常。模型读到提示后会自己调整参数重试。

**客户端怎么把工具交给大模型？**

`listTools()` 返回的每一项都带 `name`、`description`、`inputSchema`，这份结构和大模型 tool-calling 接口需要的工具定义一一对应。把列表塞进对话，等模型返回工具调用后，原样把 `name` 和 `arguments` 传给 `callTool` 即可。

**想支持远程 HTTP 调用呢？**

stdio 适合本机进程；跨机器部署通常走 HTTP 传输。服务端可用 `@modelcontextprotocol/hono` 把服务器包成 HTTP 端点，客户端用 `StreamableHTTPClientTransport` 连接。

## 参考

- MCP 官方入门（构建服务器）：`https://modelcontextprotocol.io/`
- TypeScript SDK 仓库：`https://github.com/modelcontextprotocol/typescript-sdk`
- 官方「构建第一个服务器」文档：`https://modelcontextprotocol.io/docs/2026-07-28/develop/build-server`
- 官方「构建第一个客户端」文档：`https://modelcontextprotocol.io/docs/2026-07-28/develop/build-client`
