# 快速上手

以 **pnpm workspaces** 为例，将一个多项目文件夹改造为 Monorepo。

## 1. 安装 pnpm

```bash
npm install -g pnpm
```

## 2. 创建根目录配置

需要两个文件，都放在项目根目录。

**`pnpm-workspace.yaml`** — 告诉 pnpm "哪些文件夹里有子包"：

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

意思是：`apps/` 和 `packages/` 下面的每个文件夹都是一个独立的包，pnpm 会自动识别它们。

> [!TIP]
> 根据上面的配置，最终目录结构会是这样的：
>
> ```
> my-monorepo/
> ├── package.json
> ├── pnpm-workspace.yaml
> ├── packages/
> │   └── shared/          # 共享代码
> │       ├── package.json
> │       └── src/
> │           └── index.ts
> ├── apps/
> │   ├── web/             # 前端
> │   │   └── package.json
> │   └── server/          # 后端
> │       └── package.json
> ```

**根目录 `package.json`** — 整个仓库的入口配置，至少需要 `private: true`：

```json
{
  "name": "my-monorepo",
  "private": true
}
```

> [!NOTE]
> `"private": true` 是为了防止不小心把根目录当作 npm 包发布出去。根目录本身不是包，只是一个"容器"。

## 3. 调整目录结构

将现有项目移到对应目录下。通常按用途分成两类文件夹：

- **`apps/`** — 可独立运行的应用（前端、后端），每个都要部署上线
- **`packages/`** — 被引用的共享库（类型定义、工具函数、配置），不独立部署，只给 `apps` 用

为什么要分开？如果全扔一起，时间长了分不清哪个是应用、哪个是库。分开之后一目了然。

当然这**不是强制的**。你也可以：

- 不分 `apps` 和 `packages`，全放 `packages/` 或全放一个自定义目录
- 按团队分：`team-a/`、`team-b/`
- 按功能分：`frontend/`、`backend/`、`shared/`

只要 `pnpm-workspace.yaml` 里声明了对应目录，pnpm 就能正确识别。但 `apps` + `packages` 是社区最主流、最清晰的做法。

## 4. 安装依赖

```bash
pnpm install
```

pnpm 会自动识别 workspace 中的所有包，统一安装依赖并建立包之间的软链接。

## 5. 创建共享包

`packages/shared/package.json`：

```json
{
  "name": "@my-monorepo/shared",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
```

其中：

- **`main`** — 告诉 Node.js 或打包工具：别人 `import` 这个包时，入口文件是哪个
- **`types`** — 告诉 TypeScript：类型定义文件在哪。这里和 `main` 指向同一个文件，因为 `index.ts` 本身就是 TS 文件，自带类型

`packages/shared/src/index.ts`：

```ts
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
```

## 6. 在其他包中使用共享代码

在 `apps/web/package.json` 中添加依赖：

```json
{
  "dependencies": {
    "@my-monorepo/shared": "workspace:*"
  }
}
```

`workspace:*` 表示使用本地 workspace 中的版本，而不是从 npm 下载。

然后运行 `pnpm install`，就可以直接导入了：

```ts
import type { ApiResponse } from '@my-monorepo/shared'
```
