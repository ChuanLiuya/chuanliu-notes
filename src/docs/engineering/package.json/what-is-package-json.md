# package.json

`package.json` 是 Node.js 项目的说明文件，记录了项目的基本信息、依赖、脚本命令等。几乎每个 Node.js / 前端项目根目录下都有它，工程化相关的很多配置（依赖管理、脚本、入口、发布）都围绕它展开。

## 基本字段

一个最简单的 `package.json` 长这样：

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "我的项目",
  "keywords": ["node", "javascript", "npm"]
}
```

### 常用字段一览

| 字段 | 说明 |
| --- | --- |
| `name` | 项目名，发布到 npm 时需要唯一 |
| `version` | 版本号，遵循语义化版本 |
| `description` | 项目描述，便于 `npm search` 搜索 |
| `keywords` | 关键词数组，便于 `npm search` 搜索 |
| `license` | 许可证，发布到 npm 时需要 |
| `private` | 设为 `true` 时禁止发布到 npm，应用项目建议开启 |
| `repository` | 仓库地址，开源项目常用 |
| `homepage` | 项目主页地址 |
| `bugs` | 反馈 bug 的地址 / 邮箱 |
| `author` | 作者信息 |
| `contributors` | 贡献者列表 |
| `funding` | 赞助入口 |
| `engines` | 指定 Node / npm 版本要求 |
| `type` | 模块类型，`module` / `commonjs` |
| `bin` | 可执行命令入口 |
| `main` | CommonJS 入口 |
| `module` | ES Module 入口 |
| `exports` | 现代入口配置，可区分 `import` / `require` |
| `files` | 发布到 npm 时只打包的文件白名单 |
| `scripts` | 自定义命令，`npm run xxx` 执行 |
| `workspaces` | 配置 monorepo 工作区 |
| `dependencies` | 运行时依赖，项目运行必须的包 |
| `devDependencies` | 开发时依赖，构建、测试等工具 |
| `peerDependencies` | 同伴依赖，由使用方提供的包 |
| `optionalDependencies` | 可选依赖，装不上也不影响 |
| `bundledDependencies` | 捆绑依赖，随包一起打包发布 |
| `overrides` | 覆盖依赖的版本 |

## 基本信息类字段

### name 与 version

- `name`：项目名。不打算发布时可以省略，但建议保留。规则：不含大写字母、不超过 214 字符、不能和核心 Node 模块重名；带 scope（`@scope/name`）时点号或下划线开头。
- `version`：版本号，遵循语义化版本（SemVer）：`主版本.次版本.补丁版本`。

发布到 npm 的包，`name` 和 `version` 必须同时存在，共同构成唯一标识。

### description 与 keywords

- `description`：项目描述，配合 `npm search` 被检索。
- `keywords`：关键词字符串数组。

```json
{
  "description": "我的项目",
  "keywords": ["node", "javascript", "npm"]
}
```

### license

许可证，告诉使用者是否可以免费使用、修改、再分发等：

```json
{
  "license": "MIT"
}
```

### private

`private: true` 表示这是一个应用项目，禁止被误发布到 npm：

```json
{
  "private": true
}
```

### repository

仓库地址，开源项目常用，发布后在 npm 页面会显示：

```json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/user/repo.git"
  }
}
```

### homepage 与 bugs

- `homepage`：项目主页的 URL。
- `bugs`：提交 bug 的地址或邮箱，`npm bugs` 命令会打开它。

```json
{
  "homepage": "https://github.com/npm/example#readme",
  "bugs": {
    "url": "https://github.com/npm/example/issues",
    "email": "example@npmjs.com"
  }
}
```

### author 与 contributors

- `author`：作者，一个对象（name / email / url），也可以缩写成字符串，npm 会自动解析。
- `contributors`：贡献者数组。

```json
{
  "author": "Barney Rubble <barney@npmjs.com> (http://barnyrubble.npmjs.com/)",
  "contributors": ["Alice <alice@example.com>"]
}
```

### funding

为开源项目维护者提供“求赞助”入口，支持对象、字符串或数组：

```json
{
  "funding": {
    "type": "individual",
    "url": "https://example.com/donate"
  }
}
```

### engines

指定 Node / npm 版本要求，装依赖时 npm 会给出提示：

```json
{
  "engines": {
    "node": ">=18",
    "npm": ">=9"
  }
}
```

## 模块与入口类字段

### type 字段

`type` 决定 `.js` 文件被解释成哪种模块系统：

- `"type": "module"`：`.js` 文件按 ES Module 解析
- `"type": "commonjs"`：`.js` 文件按 CommonJS 解析（默认值）

也可以用文件扩展名单独指定某个文件：`.mjs` 一定是 ES Module，`.cjs` 一定是 CommonJS。

### bin 字段

`bin` 用于把包内的某个文件暴露成命令行命令，安装后即可在终端直接运行：

```json
{
  "name": "my-cli",
  "bin": {
    "my-cli": "./bin/cli.js"
  }
}
```

### main、module、exports 字段

一个同时支持两种模块系统的包，会提供两个入口文件：

- `main`：CommonJS 入口，用 `require()` 引入时加载
- `module`：ES Module 入口，用 `import` 引入时加载（打包工具也用它做 tree-shaking）

```json
{
  "name": "my-lib",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs"
}
```

`exports` 是更现代的写法，可以更精细地控制按哪种方式引入时加载哪个文件：

```json
{
  "name": "my-lib",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

这样 `import` 和 `require` 会各自加载对应的入口文件。

`exports` 还有两个额外好处：

- **白名单**：只暴露你允许的文件，别人无法直接 import 包内部的源码
- **优先级最高**：`exports` > `module` > `main`

#### 只写 exports 还是三个都写？

- 只写 `exports`：现代 Node.js（12.7+）和现代打包工具（Vite 等）都支持，够用
- 三个都写：老版本 Node 和旧打包工具不认识 `exports`，会退回看 `module` 和 `main`，所以发布到 npm 的库常三个都写，保证兼容

```json
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

## 发布类字段

### files 字段

可选的 `files` 字段是一个数组，用于描述包作为依赖安装时应包含的条目。

文件模式采用与 `.gitignore` 类似的语法，但**相反**：包括某个文件、目录或通配符模式（`*`、`**/*` 等）将使该文件在打包时包含在 tarball 中。省略该字段将默认使用 `["*"]`，即包含所有文件。（[tarball 和通配符是什么？见附录](#附录)）

```json
{
  "name": "my-lib",
  "files": ["dist"]
}
```

- `files: ["dist"]` 表示只发布 `dist` 目录，避免把源码、测试、配置文件一起发出去
- `files` 是白名单，优先级高于根目录的 `.npmignore`

#### 始终包含的文件

无论设置如何，某些文件总是被包含（`README` 和 `LICENSE` 可以有任何大小写和扩展名）：

- `package.json`
- `README`
- `LICENSE` / `LICENCE`
- `main` 字段指向的文件
- `bin` 字段指向的文件

#### 默认忽略的文件

默认情况下，以下文件总是被忽略：

- `*.orig`、`.*.swp`
- `.DS_Store`、`._*`
- `.git`、`.hg`、`.svn`、`CVS`
- `.lock-wscript`、`.wafpickle-N`
- `.npmrc`
- `config.gypi`
- `node_modules`
- `npm-debug.log`
- `package-lock.json`（如果希望发布锁文件，可以使用 [`npm-shrinkwrap.json`](https://npm.nodejs.cn/cli/v11/configuring-npm/npm-shrinkwrap-json)）
- `pnpm-lock.yaml`、`yarn.lock`、`bun.lockb`

其中大多数文件如果被包含在 `files` 通配符中，可以被特别包含回来。**例外**（无论如何都无法包含）有：

- `.git`
- `.npmrc`
- `node_modules`
- `package-lock.json`
- `pnpm-lock.yaml`
- `yarn.lock`
- `bun.lockb`

#### 配合 .npmignore 排除

可以在包的根目录或子目录中提供 `.npmignore` 文件来防止文件被包含：

- 在包的**根目录**中，它不会覆盖 `files` 字段（`files` 白名单优先级更高）
- 在**子目录**中，它会覆盖 `files` 字段
- `.npmignore` 的工作方式与 `.gitignore` 一样
- 如果存在 `.gitignore` 而 `.npmignore` 缺失，则会使用 `.gitignore` 的内容

## 脚本

### scripts 脚本

`scripts` 里可以定义常用命令，用 `npm run 名字` 执行：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "start": "node index.js",
    "test": "vitest"
  }
}
```

两个特殊命令可以省略 `run`：

- `npm start` 执行 `start`
- `npm test` 执行 `test`

## 依赖类字段

依赖相关的六个字段详见 [依赖管理](/languages/Node.js/dependencies)，这里只做概览：

| 字段 | 说明 |
| --- | --- |
| `dependencies` | 运行时依赖，项目运行必须的包 |
| `devDependencies` | 开发时依赖，构建、测试等工具 |
| `peerDependencies` | 同伴依赖，由使用方提供的包 |
| `optionalDependencies` | 可选依赖，装不上也不影响 |
| `bundledDependencies` | 捆绑依赖，随包一起打包发布 |
| `overrides` | 覆盖依赖的版本 |

### workspaces 工作区

`workspaces` 用于配置 monorepo 工作区，让一个仓库里管理多个子包：

```json
{
  "private": true,
  "workspaces": ["packages/*", "apps/*"]
}
```

配合 `pnpm-workspace.yaml` 使用时，pnpm 会优先读取 yaml 配置（见 [Monorepo](/engineering/monorepo/what-is-monorepo)）。

### 锁文件

安装依赖后会生成锁文件（`package-lock.json` 或 `pnpm-lock.yaml`），它记录了每个依赖的确切版本。锁文件应该提交到 git，保证大家安装的依赖版本一致。

## 版本号

版本号遵循语义化版本（SemVer）：`主版本.次版本.补丁版本`。

- `1.2.3`：固定版本，只装这个版本
- `^1.2.3`：允许次版本和补丁版本更新（`1.x.x`）
- `~1.2.3`：只允许补丁版本更新（`1.2.x`）
- `*`：任意版本（不推荐）

## 附录

### tarball 是什么

tarball = 打包成一个文件的压缩包（通常叫 `.tar.gz` 或 `.tgz`），跟 `.zip` 是同类东西。

在 npm 的语境下，它的含义是「你发布到 npm 的整个包」：

> 你的项目文件 → npm pack 打包 → my-lib-1.0.0.tgz（这就是 tarball）→ 上传到 npm registry → 别人 npm install 时下载解压到 node_modules

所以文档里说「包含在 tarball 中」，意思就是包含在最终发布出去的包里。`files` 字段就是用来控制哪些文件会进这个压缩包。

可以自己体验一下：在项目里运行 `npm pack`，会生成一个 `.tgz` 文件，把它解压看看，里面就是别人 `npm install` 你的包时会拿到的全部内容。

### 通配符是什么

通配符（glob pattern）是用特殊符号匹配一批文件的写法，`files` 数组里每一项都可以是这种模式。常见的有：

| 写法 | 含义 | 例子 |
| --- | --- | --- |
| `*` | 匹配任意字符（不跨目录） | `*.js` 匹配根目录所有 `.js` 文件 |
| `**` | 匹配任意层级的目录 | `src/**/*` 匹配 `src` 下所有层级的文件 |
| `?` | 匹配单个字符 | `a?.js` 匹配 `a1.js`、`ab.js` |
| 目录名 | 直接写目录，包含整个目录 | `dist` 包含整个 `dist` 目录 |

举个具体例子，下面这几种写法：

```json
// 只发布 dist 整个目录
"files": ["dist"]

// 只发布根目录下的 .js 文件
"files": ["*.js"]

// 发布 src 下所有子目录的所有文件
"files": ["src/**/*"]
```

> 文档里那句「大多数被忽略的文件如果被包含在 `files` 通配符中，可以被特别包含回来」，意思就是：比如 `*.orig` 默认被忽略，但你可以在 `files` 里写 `["**/*.orig"]` 强行把它重新包含进来。
