# compilerOptions 字段详解

`compilerOptions` 是 tsconfig.json 中最核心的部分，用来配置编译行为。这里按用途分组介绍常用字段。

## 基础编译选项

### target

编译成哪个版本的 JavaScript。

::: details 所有可选值

- `ES3`
- `ES5`
- `ES2015`（`ES6`）
- `ES2016`
- `ES2017`
- `ES2018`
- `ES2019`
- `ES2020`
- `ES2021`
- `ES2022`
- `ES2023`
- `ES2024`
- `ES2025`
- `ESNext`：永远指向最新版本，随 TypeScript 版本升级而变化
  :::

值越小（如 `ES5`）兼容性越好，但能用的新语法越少；值越大（如 `ES2020`、`ESNext`）越能使用新语法，但要求运行环境较新。

**例：同一份源码，不同 target 的编译对比**

分别用两种配置编译同一段源码：

```json
// 配置 1：target: "ES5"
{
  "compilerOptions": {
    "target": "ES5"
  }
}
```

```json
// 配置 2：target: "ESNext"
{
  "compilerOptions": {
    "target": "ESNext"
  }
}
```

源码：

```ts
const greeting = (name: string) => `Hello, ${name}!`;
const nums = [1, 2, 3];
const [first, ...rest] = nums;
```

**target: "ES5" 编译结果**：

```js
var greeting = function (name) {
  return "Hello, " + name + "!";
};
```

**target: "ESNext" 编译结果**：

```js
const greeting = (name) => `Hello, ${name}!`;
```

| 源码写法 | `ES5` 编译结果      | `ESNext` 编译结果 |
| -------- | ------------------- | ----------------- |
| 箭头函数 | 转成普通 `function` | 原样保留          |

结论：`target` 越小降级越狠、兼容性越好；`target` 越大代码越接近源码，但要求运行环境本身支持这些新语法。

::: details 例 2：async/await 的降级对比

上面例子里的语法差异还算温和，遇到 async/await 这种"低版本没有等价写法"的语法时，差异会**非常大**。

源码：

```ts
async function fetchData() {
  const res = await fetch("/api");
  return res.json();
}
```

**target: "ES2020" 编译结果**（现代环境原生支持 async，几乎原样）：

```js
async function fetchData() {
  const res = await fetch("/api");
  return res.json();
}
```

**target: "ES5" 编译结果**（ES5 没有 async/await，编译器要手动模拟状态机）：

```js
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      return step(
        (generator = generator.apply(thisArg, _arguments || [])).next(),
      );
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
function fetchData() {
  return __awaiter(this, void 0, void 0, function () {
    var res;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, fetch("/api")];
        case 1:
          res = _a.sent();
          return [2 /*return*/, res.json()];
      }
    });
  });
}
```

3 行代码变成几十行辅助代码，整个项目这么转下来，产物体积和运行开销差别非常大。

:::

**那配置 target 的意义是什么？**

- **决定产物能在哪些环境跑**：`ES5` 兼容 IE 等老环境，`ES2020` 要求运行环境本身支持新语法
- **决定产物体积和性能**：`target` 越小降级越狠、辅助代码越多，产物越大越慢
- **决定能用的标准库类型**：`target` 顺带影响 `lib`，`target` 太低时 `Promise.allSettled`、`BigInt`、`globalThis` 等新 API 的类型会报错

**推荐值**

- **现代前端（Vue / React + 打包器）**：`ESNext` 或 `ES2020`
- **Node.js 后端**：`ES2020`（Node 16+ 已支持 `ES2021` 的大部分语法）
- **需要兼容老浏览器**：`ES5`
- **拿不准时**：`ES2020` 是一个稳妥的中间选择

### lib

指定编译时包含哪些标准库的类型定义（如 `DOM`、`ES2020`）。

默认会根据 `target` 自动选择对应版本的标准库，一般**不需要手动配置**。需要用到特定环境的 API 类型时才手动指定，比如在 Node 或浏览器环境下补充 `DOM` 类型。

### module

生成的代码使用哪种模块系统。`target` 决定"语法降级到哪一版"，`module` 决定"模块语法（`import` / `export`）怎么处理"。

::: details 所有可选值
- `CommonJS`：Node.js 传统模块系统，把 `import/export` 转成 `require` / `module.exports`
- `ES2015`（`ES6`）到 `ESNext`：保留 ES 模块语法，交给运行环境或打包器处理
- `Preserve`（TS 5.4+）：原样保留 `import/export`，最适合配合打包器
- `Node16` / `NodeNext`：跟随 `package.json` 的 `type` 字段，`.ts` 文件按 ESM 或 CJS 分别处理
- `AMD`：浏览器端异步加载模块（如 require.js）
- `UMD`：同时兼容 AMD、CommonJS 和全局变量，常用于发布库
- `System`：SystemJS 模块
:::

这些值大致分两类：`ES2015` ~ `ESNext`、`Preserve` 这类**保留 ESM 语法**；`CommonJS`、`AMD`、`UMD`、`System` 这类**会转换模块语法**。

::: details 同一份源码，不同 module 的编译对比
源码：

```ts
import { readFile } from "fs";
import { add } from "./math";

export const result = add(1, 2);
```

**module: "CommonJS" 编译结果**（转成 `require` / `exports`）：

```js
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.result = void 0;
const fs_1 = require("fs");
const math_1 = require("./math");
exports.result = (0, math_1.add)(1, 2);
```

**module: "ESNext" 编译结果**（保留 ES 模块语法）：

```js
import { readFile } from "fs";
import { add } from "./math";

export const result = add(1, 2);
```

**module: "UMD" 编译结果**（加了一层兼容各种环境的包装）：

```js
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "fs", "./math"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.result = void 0;
    const fs_1 = require("fs");
    const math_1 = require("./math");
    exports.result = (0, math_1.add)(1, 2);
});
```
逐行对比：

| 源码写法 | `CommonJS` 编译结果 | `ESNext` 编译结果 |
| --- | --- | --- |
| `import ... from` | 转成 `require(...)` | 原样保留 |
| `export const` | 转成 `exports.result = ...` | 原样保留 |
| 变量重命名 | 为避免冲突自动加后缀（`fs` 变 `fs_1`） | 原样保留 |
:::

**推荐值**

- **现代前端（Vue / React + 打包器）**：`ESNext` 或 `Preserve`
- **Node.js 后端（传统）**：`CommonJS`
- **Node.js 后端（新项目）**：`Node16` / `NodeNext`
- **发布 npm 库**：`ESNext`（配合构建工具产出 ESM / CJS 双版本）
- **老浏览器直接加载**：`UMD` 或 `AMD`

### moduleResolution

模块解析策略，决定 `import` 语句里的路径**如何在磁盘上找到对应的文件**。下面按不同取值分别举例说明。

**node（node10）—— 老 Node.js 规则**

```ts
// 相对导入：按顺序尝试
import { add } from "./math";
// 1. ./math.ts / .tsx / .d.ts
// 2. ./math/index.ts / index.d.ts

// 非相对导入：逐级向上找 node_modules
import { defineComponent } from "vue";
// 找到后看 package.json 的 main / types 字段定入口
```

特点：不区分 ESM / CJS，是 `module: "CommonJS"` 时代的默认规则。

**node16 / nodenext —— 现代 Node 规则**

跟随 `package.json` 的 `type` 字段决定按哪套规则：

```json
// package.json
{ "type": "module" }
```

```ts
// ESM 文件里，相对导入必须带扩展名（.js 指向 .ts 源文件）
import { add } from "./math.js";
```

非相对导入则严格按库的 `exports` 字段选入口：

```json
// 库的 package.json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

特点：和 Node 实际运行行为完全一致，最严格，ESM 文件里省略扩展名会直接报错。

**bundler —— 打包器规则（Vite / webpack）**

```ts
// 相对导入可以省略扩展名
import { add } from "./math";

// 可以导入任意扩展名的文件（配合插件）
import App from "./App.vue";
```

非相对导入读取 `exports` 的 `import` 条件，返回给打包器处理。

特点：规则最宽松，和 Vite / webpack 的解析行为对齐，现代前端项目标配。

**推荐**

- 现代前端（Vite / webpack）：`bundler`
- Node.js 后端（传统 CJS）：`node`
- Node.js 后端（现代 ESM）：`nodenext`
- 旧项目模板里若出现 `node` 或 `classic`，升级时建议换成上面三者

## 类型检查

### strict

开启后同时打开**所有**严格检查项（`strictNullChecks`、`noImplicitAny`、`strictFunctionTypes` 等）。推荐新项目一律开启。

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

### strictNullChecks

严格空值检查。开启后 `null` / `undefined` 不能直接赋给其他类型，必须显式处理，能有效避免大量运行时错误。

### noImplicitAny

禁止隐式 `any`。参数或变量没有类型注解时会报错，强制你写清楚类型。

### skipLibCheck

跳过 `.d.ts` 声明文件的类型检查，可以加快编译速度，一般保持开启。

### forceConsistentCasingInFileNames

强制文件名大小写一致，避免在 Windows 和 Linux 之间出现"本地能跑、线上报错"的问题，推荐开启。

## 模块相关

### esModuleInterop

让 ES 模块的默认导入（`import x from 'y'`）能正常工作在 CommonJS 模块上，避免写 `import * as x` 的别扭写法。推荐开启。

```json
{
  "compilerOptions": {
    "esModuleInterop": true
  }
}
```

### allowSyntheticDefaultImports

允许对没有默认导出的模块使用默认导入（仅类型层面生效），一般会跟随 `esModuleInterop` 一起开启。

### resolveJsonModule

允许 `import` JSON 文件，比如直接导入 `package.json`：

```ts
import pkg from "./package.json";
```

### baseUrl + paths

配置路径别名，让 `@/` 这类写法映射到实际目录，避免写一长串相对路径：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

```ts
import App from "@/App.vue";
```

## 输出相关

### outDir

编译产物的输出目录：

```json
{
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

### rootDir

源文件根目录，决定编译后在 `outDir` 里保持的目录结构。

### sourceMap

是否生成 `.map` 文件。开启后调试时能映射回 TS 源码，而不是压缩后的 JS。

### declaration

是否生成 `.d.ts` 类型声明文件。**发布 npm 库时**必须开启，这样使用者才能获得类型提示。

### noEmit

只做类型检查，不输出文件。常用于：

- 只在 IDE 里做类型检查
- 编译交给打包器（Vite、webpack），TS 只负责类型检查

```json
{
  "compilerOptions": {
    "noEmit": true
  }
}
```

### removeComments

编译时移除注释，减小产物体积。

## 工程相关

### incremental

开启增量编译，记录上次编译结果，再次编译时只处理改动过的文件，加快编译速度。

### isolatedModules

每个文件**独立**编译，配合 Babel / SWC 等"单文件转译器"使用。开启后要避免使用依赖跨文件类型信息的语法（如 `const enum`、类型导入未加 `import type`）。

## 典型配置示例

一个 Vue 3 + Vite 项目的常见配置：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.vue"],
  "exclude": ["node_modules", "dist"]
}
```
