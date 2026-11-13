# 分步指南

## 创建表

### 创建模型

首先，你得有一个模型，才能创建表。比如下面的 **test**模型：

```ts
export class Test {
  id: string;
  title: string;
  content: string;
}
```

### 创建实体

实体是被`@Entity`装饰器标记的模型，这样的模型会被创建为数据库的一个表。

```ts
import { Entity } from "typeorm";

@Entity()
export class Test {
  id: string;
  title: string;
  content: string;
}
```

现在，`Test`实体会创建对应的数据库表。但是表创建了，还没创建列呢！

### 添加列

用`@Column`装饰器

```ts
import { Entity } from "typeorm";

@Entity()
export class Test {
  @Column()
  id: string;
  @Column()
  title: string;
  @Column()
  content: string;
}
```

这样，`Test`表就会添加这三列。列的数据库类型会根据属性类型推断，
比如 `number` 映射为`integer`,`string`会映射为`varchar`等等。

创建了列，但是没有主键列，每一个数据库的表，都要有**主键列**

使用`@PrimaryColumn`装饰器来设置主键列

```ts
import { Entity } from "typeorm";

@Entity()
export class Test {
  @PrimaryColumn()
  id: string;
  @Column()
  title: string;
  @Column()
  content: string;
}
```

如果希望id是自增模型的话，可以使用`@PrimaryGenerateColumn`装饰器：

```ts
import { Entity } from "typeorm";

@Entity()
export class Test {
  @PrimaryGenerateColumn()
  id: string;
  @Column()
  title: string;
  @Column()
  content: string;
}
```

现在还只是默认映射，我们可以指定更合适的数据类型:

```ts
import { Entity } from "typeorm";

@Entity()
export class Test {
  @PrimaryGenerateColumn()
  id: string;
  @Column({
    length: 100,
  })
  title: string;
  @Column("text")
  content: string;
}
```

## 创建`DataSource`

```ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "../config/env";
import { TestEntity } from "./entities/test";

export const dataSource = new DataSource({
  type: "better-sqlite3",
  database: env.dbPath,
  entities: [TestEntity],
  synchronize: true,
});
// 初始化连接数据库、注册实体并同步数据库架构
try {
  await AppDataSource.initialize();
} catch (error) {
  console.log(error);
}
```

## 选择你的管理数据的途径

你现在有两种选择，
- 使用实体管理器Entity Manager
- 使用仓库Repositoryies