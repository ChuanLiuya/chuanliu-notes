# TypeORM 快速上手

## 1. 安装

安装npm包：

```bash
npm install typeorm
npm install reflect-metadata
```

你可能需要安装Node类型定义：

```bash
npm install @types/node --save-dev
```

然后你需要安装数据库。SQlite或者是MYSQL等等。

## 2. TypeScript 配置

在`tsconfig.json`中启用了以下配置：

```ts
"emitDecoratorMetadata": true,
"experimentalDecorators": true,
```

## 3. 创建项目

你可以参考如下指令：

```bash
npx typeorm init --name MyProject --database sqlite
```

其中`name`是项目名称，`database`是使用的数据库，可选`mysql`，`sqlite`等。

然后安装依赖：

```bash
npm install
```

这个命令创建之后是Nodejs应用，你当然也可以在其他平台使用。

## 4. 编辑数据库连接配置

```ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "../config/env";
import { TestEntity } from "./entities/test";

export const dataSource = new DataSource({
  type: "better-sqlite3",
  database: env.dbPath,
  entities: [TestEntity],
  synchronize: true, // 开发阶段：实体结构变化时自动同步表结构
});
```

我的项目是electron接入sqlite的。所以需要配置这些。如果你使用的是别的数据库，可能需要配置`port`,`username`,`password`等。
以下是官方配置postgres的例子：

```ts
export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "test",
  password: "test",
  database: "test",
  synchronize: true,
  logging: true,
  entities: [Post, Category],
  subscribers: [],
  migrations: [],
});
```

然后启动应用。
