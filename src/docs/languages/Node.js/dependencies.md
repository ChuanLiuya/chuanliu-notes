# 依赖字段

`package.json` 中与依赖相关的字段有六个，它们决定了 `npm install` 时安装哪些包、发布时如何处理依赖。

| 字段 | 说明 |
| --- | --- |
| `dependencies` | 运行时依赖，项目运行必须的包 |
| `devDependencies` | 开发时依赖，构建、测试等工具 |
| `peerDependencies` | 同伴依赖，由使用方提供的包 |
| `optionalDependencies` | 可选依赖，装不上也不影响 |
| `bundledDependencies` | 捆绑依赖，随包一起打包发布 |
| `overrides` | 覆盖依赖的版本 |

关于 `package.json` 的其他常用字段，见 [package.json 常用字段](/engineering/package.json/what-is-package-json)。

## dependencies

运行时依赖，项目运行必须的包。别人 `npm install` 你的包时会一起安装。

```bash
npm install express
```

```json
{
  "dependencies": {
    "express": "^4.19.0"
  }
}
```

## devDependencies

开发时依赖，只在开发阶段用到的包（构建、测试、代码检查等），不会随包发布，生产环境安装时默认不装。

```bash
npm install -D typescript
# 等价写法
npm install --save-dev typescript
```

```json
{
  "devDependencies": {
    "typescript": "^5.5.0",
    "vitest": "^2.0.0"
  }
}
```

## peerDependencies

同伴依赖：声明「我这个包需要使用方提供某个依赖」，常用于插件、组件库。

例如一个 Vue 组件库，需要使用者自己安装 Vue：

```json
{
  "peerDependencies": {
    "vue": "^3.4.0"
  }
}
```

特点：

- 不会被自动安装，由使用方提供
- 使用方版本不满足时会收到警告
- 声明时用 `--save-peer`

```bash
npm install vue --save-peer
```

## optionalDependencies

可选依赖：安装失败不会导致整体安装失败。常用于平台相关的包（如 macOS 下的 `fsevents`）。

```bash
npm install fsevents --save-optional
```

```json
{
  "optionalDependencies": {
    "fsevents": "^2.3.3"
  }
}
```

代码里使用时需要自己判断是否安装成功：

```js
try {
  const fsevents = require("fsevents");
} catch (e) {
  // 没装上也没关系，跳过
}
```

## bundledDependencies

捆绑依赖：发布时把这些依赖一起打包进 tarball，别人安装时不需要再单独下载。实际中很少用到。

```json
{
  "bundledDependencies": ["my-internal-lib"]
}
```

`bundleDependencies` 是它的别名，两者等价。

## overrides

覆盖依赖的版本：当某个传递依赖（依赖的依赖）版本有问题时，可以强制指定它的版本。

```json
{
  "overrides": {
    "lodash": "4.17.21"
  }
}
```

也可以嵌套覆盖某个依赖内部的传递依赖：

```json
{
  "overrides": {
    "express": {
      "cookie": "0.6.0"
    }
  }
}
```

注意：`overrides` 主要用于覆盖**传递依赖**。如果要覆盖直接声明的依赖，版本声明需与 `dependencies` 中保持一致，否则会报 `EOVERRIDE` 错误。
