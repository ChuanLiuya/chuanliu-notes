# Node.js 模块

Node.js 采用模块化的方式来组织代码，一个文件就是一个模块。模块系统让代码可以按功能拆分、复用，也方便管理依赖。

例子：

导出一个函数

``` ts
//addTwo.mjs
function addTwo(num) {
    return num + 2;
}

export { addTwo };
```

从一个模块导入这个函数：
``` ts
import { addTwo } from './addTwo.mjs'

console.log(addTwo(4))

```


## 两种模块系统

Node.js 支持两种模块系统：`ES Module` 和 `CommonJS`。

可以通过`.mjs`的文件拓展名告诉nodejs将JavaScript解释为ES模块，或者在`package.json`中写`"type": "module"`。
反过来，也可以用`.cjs`的文件拓展名告诉nodejs将JavaScript解释为CommonJS模块，或者在`package.json`中写`"type": "commonjs"`



## 模块的类型

Node.js 中的模块主要分为三类：

### 内置模块

Node.js 自带的模块，无需安装即可使用，例如 `fs`、`path`、`http`、`os`、`url` 等。

```js
import fs from "fs";
import path from "path";
```

### 自定义模块

我们自己创建的文件就是一个模块，通过 `export` 导出内容，再用 `import` 引入。

```js
// math.js
export function add(a, b) {
  return a + b;
}
```

```js
// main.js
import { add } from "./math.js";

console.log(add(1, 2)); // 3
```

### 第三方模块

通过 npm/pnpm 安装的模块，例如 `express`、`lodash`，引入时直接写包名即可。

```js
import express from "express";
```
