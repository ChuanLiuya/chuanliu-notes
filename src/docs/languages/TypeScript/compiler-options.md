# compilerOptions 字段详解

`compilerOptions` 是 tsconfig.json 中最核心的部分，用来配置编译行为。这里按用途分组介绍常用字段。

## 基础编译选项

### target

编译成哪个版本的 JavaScript。

- 值越小（如 `ES5`）兼容性越好，但能用的新语法越少
- 值越大（如 `ES2020`、`ESNext`）越能使用新语法，但要求运行环境较新

```json
{
  "compilerOptions": {
    "target": "ES2020"
  }
}
```

现代项目一般直接用 `ES2020` 或 `ESNext`，转译低版本语法的任务交给打包器或 Babel。

### lib

指定编译时包含哪些标准库的类型定义（如 `DOM`、`ES2020`）。

默认会根据 `target` 自动选择对应版本的标准库，一般**不需要手动配置**。需要用到特定环境的 API 类型时才手动指定，比如在 Node 或浏览器环境下补充 `DOM` 类型。

### module

生成的代码使用哪种模块系统：

- `CommonJS`：Node.js 项目常用
- `ESNext` / `ES2020`：现代打包器（Vite、webpack）常用
- `AMD`、`UMD`：老项目或特殊场景

```json
{
  "compilerOptions": {
    "module": "ESNext"
  }
}
```

### moduleResolution

模块解析策略，即 `import` 语句如何找到目标文件：

- `node` / `node16`：Node.js 风格
- `bundler`：配合打包器使用（Vite、webpack 等），现代前端项目常用

### jsx

JSX 语法如何处理（React / Vue 项目）：

- `preserve`：保留 JSX，交给打包器处理
- `react`：编译成 `React.createElement`
- `react-jsx`：React 17+ 自动导入，无需手动引入 React

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
import pkg from "./package.json"
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
import App from "@/App.vue"
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
