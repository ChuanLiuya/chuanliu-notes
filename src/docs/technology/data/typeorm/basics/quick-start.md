# TypeORM 快速上手

本教程带你使用typeorm操作 better-sqlite3。

## 1. 创建项目
你可以参考如下指令：

```bash
npx typeorm init --name MyProject --database better-sqlite3
```

这是typeorm官方提供的方式，可以直接创建一个typeorm的项目。


然后安装依赖。
``` bash
npm i
```

安装之后，你的目录如下：
```
MyProject
├── src                   // 放置 TypeScript 代码的目录
│   ├── entities          // 存放实体（数据库模型）
│   │   └── User.ts       // 示例实体
│   ├── migrations        // 迁移文件目录
│   ├── data-source.ts    // 数据源及连接配置
│   └── index.ts          // 应用入口
├── .gitignore            // 标准 gitignore 文件
├── package.json          // Node 模块依赖
├── README.md             // 简单的说明文件
└── tsconfig.json         // TypeScript 编译器选项
```

然后，你会发现没有安装better-sqlite3。

安装一下：

``` bash
npm i better-sqlite3
```

::: details 安装失败？
如果你安装失败，可以尝试这样：

``` bash

# 设置镜像环境变量（注意是 npm_config_ 前缀）
$env:npm_config_better_sqlite3_binary_host_mirror="https://registry.npmmirror.com/-/binary/better-sqlite3"

# 然后安装
npm install better-sqlite3

```

不用担心这个配置会污染你的系统，这个配置仅仅会存在于当前打开的终端而已。
:::

## 2. 启动

``` bash
npm run start
```

结束。
