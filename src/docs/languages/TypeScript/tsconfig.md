# tsconfig.json

## tsconfig.json 是什么？

**tsconfig.json** 是 TypeScript 项目的**配置文件**，用于告诉 `tsc` 编译器：编译哪些文件、按什么规则编译、输出到哪里。

有了它，运行 `tsc` 时就不需要每次手动传入一堆命令行参数，编译器会直接读取配置文件里的设置。

## 如何创建

执行以下命令，会在当前目录自动生成一个带默认配置的 `tsconfig.json`：

```bash
tsc --init
```

也可以手动新建一个空的 `tsconfig.json` 文件，然后逐项填写配置。

## 核心配置项

### compilerOptions

最核心的部分，用来配置编译行为，包括编译目标、模块系统、类型检查严格度、输出目录等。

每个字段的详细说明见 [compilerOptions 字段详解](./compiler-options)。

### include / exclude / files

用来指定编译哪些文件：

- `include`：包含哪些目录或文件
- `exclude`：排除哪些目录或文件
- `files`：直接列出要编译的文件（比 `include` 更精确）

```json
{
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### extends

继承另一个配置文件，常用于拆分配置或复用公共配置：

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

## 常用配置示例

（待补充一个完整可用的示例）
