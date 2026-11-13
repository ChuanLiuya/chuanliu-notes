# 基础

## 输入

``` ts
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const rl = createInterface({ input: stdin, output: stdout });

const name = await rl.question("请输入你的名字: ");
console.log(`你好，${name}!`);

const age = await rl.question("请输入你的年龄: ");
console.log(`你 ${age} 岁。`);

rl.close();
```

### 导入模块

```ts
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
```

- `node:readline/promises`：Node.js 内置的 **readline** 模块，用来逐行读取输入流。`/promises` 后缀表示这个版本提供的是**基于 Promise 的 API**（不需要再手动套 Promise 或回调）。
- `createInterface`：创建一个"读写接口"，把**输入流**（`stdin`，即键盘输入）和**输出流**（`stdout`，即屏幕打印）绑在一起。
- `node:process` 里的 `stdin` / `stdout` 分别是标准输入和标准输出。

### 创建读写接口

```ts
const rl = createInterface({ input: stdin, output: stdout });
```

把键盘输入和屏幕输出组合成一个 `rl` 对象，后续的提问、读入、输出都通过它完成。

### 提问并读取

```ts
const name = await rl.question("请输入你的名字: ");
console.log(`你好，${name}!`);
```

- `rl.question("...")` 会先在终端打印提示文字，然后**等待用户输入一行并按回车**。
- 由于这是 `promises` 版本，它返回一个 Promise，所以可以直接 `await` 拿到用户输入的那行字符串（不含回车符）。
- `console.log` 用模板字符串 `` `你好，${name}!` `` 把结果打印出来。

```ts
const age = await rl.question("请输入你的年龄: ");
console.log(`你 ${age} 岁。`);
```

同样的流程再问一次年龄。注意这里 `age` 拿到的是**字符串**（比如 `"18"`），并没有转成数字——如果要做年龄计算，需要 `Number(age)` 或 `parseInt(age)`。

### 关闭接口

```ts
rl.close();
```

关闭接口，结束读取，程序正常退出。如果不调用它，进程会因为输入流还开着而**一直挂着不结束**。

### 整体流程

`createInterface` 把标准输入/输出封装成一个可交互的读写器 → 用 `await rl.question()` 依次同步地"问一句、读一行" → 最后 `rl.close()` 关闭并退出。因为是 Promise 版本，配合顶层的 `await`（ESM 模块里允许）写起来就像串行对话一样清晰。

::: tip
这段代码依赖 Node.js 的运行环境（`node:` 前缀的模块），它不是浏览器里能跑的 JS。
:::
