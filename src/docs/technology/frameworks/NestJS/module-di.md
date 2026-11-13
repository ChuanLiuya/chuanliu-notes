# 模块化架构与依赖注入

> 本篇学习 Nest 的模块（Module）系统和依赖注入（DI）机制——如何把代码拆成独立的功能块，以及它们之间怎么自动协作。

---

## 什么是模块（Module）？

模块是 Nest 组织代码的**基本单元**。每个功能领域封装在自己的模块里，比如用户模块、帖子模块、订单模块。

```ts
@Module({
  imports: [],       // 引入其他模块
  controllers: [],   // 注册控制器
  providers: [],     // 注册服务
  exports: [],       // 导出服务，给其他模块用
})
export class XxxModule {}
```

---

## 创建模块、服务、控制器

用 CLI 一键生成：

```bash
nest g module cats
nest g service cats
nest g controller cats
```

生成的结构：

```
src/
└── cats/
    ├── cats.module.ts
    ├── cats.service.ts
    └── cats.controller.ts
```

---

## 拆解三个文件

### `cats.module.ts`

```ts
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```

| 配置项 | 作用 |
|--------|------|
| `controllers` | 注册控制器，处理 HTTP 请求 |
| `providers` | 注册服务，供控制器或其他服务注入 |
| `imports` | 引入其他模块，使用其导出的服务 |
| `exports` | 导出本模块的服务，给其他模块使用 |

---

### `cats.service.ts`

```ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class CatsService {
  getCats(): string[] {
    return ['Tom', 'Garfield', 'Kitty'];
  }
}
```

**`@Injectable()`**

声明这个类可以被 Nest 的 IoC 容器管理，从而在构造函数里自动注入。

::: tip 如果忘了写 @Injectable()
Nest 会报错：`CatsService is not a provider` —— 容器找不到这个依赖。
:::

**`getCats()`**

业务方法，返回数据。实际项目里这里可能是查数据库、调第三方 API。

---

### `cats.controller.ts`

```ts
import { Controller, Get } from '@nestjs/common';
import { CatsService } from './cats.service';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  findAll(): string[] {
    return this.catsService.getCats();
  }
}
```

**`@Controller('cats')`**

声明路由前缀。传 `'cats'` 表示这个控制器下所有路由都以 `/cats` 开头。

**`constructor(private readonly catsService: CatsService) {}`**

在构造函数里声明需要什么 Service，Nest 自动注入。这一行做的事：

```ts
// 等价于你自己写：
private readonly catsService: CatsService;

constructor(catsService: CatsService) {
  this.catsService = catsService; // Nest 帮你做了这一步
}
```

这就是**依赖注入**——你只需要声明"我需要什么"，Nest 负责找到并注入它。

**`@Get()`**

处理 GET 请求。这里为空，匹配 `GET /cats`。

**`findAll()`**

方法名随便起。`return this.catsService.getCats()` — Controller 不处理数据，调 Service 拿结果。**Controller 对接请求和响应，Service 处理业务逻辑。**

---

## 把模块挂到根模块

在 `app.module.ts` 中引入：

```ts
import { Module } from '@nestjs/common';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule {}
```

---

## 测试

```bash
npm run start
```

访问 `http://localhost:3000/cats`：

```json
["Tom", "Garfield", "Kitty"]
```

---

## 依赖注入（DI）原理

当你写：

```ts
constructor(private readonly catsService: CatsService) {}
```

Nest 在背后做的事：

1. 看 `catsService: CatsService` — 发现你需要 `CatsService` 的实例
2. 去当前模块（或其 imports 的模块）的 `providers` 里找 `CatsService`
3. 找到了 → 注入它的单例实例
4. 没找到 → 报错

::: info 单例
默认情况下，同一个 Service 全应用只有一个实例，不管被多少模块引用。不会出现多个模块各自创建一份的问题。
:::

---

## 跨模块共享服务（`exports`）

如果 `DogsModule` 也想用 `CatsService`，需要两步：

**第 1 步：在 `cats.module.ts` 中导出**

```ts
@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}
```

**第 2 步：在 `dogs.module.ts` 中引入**

```ts
@Module({
  imports: [CatsModule],
  // 现在可以在 DogsModule 的 controller/service 中注入 CatsService 了
})
export class DogsModule {}
```

没有 `exports` 的服务是模块私有的，其他模块无法注入。

---

## 一个请求的完整路径

```
浏览器: GET /cats
  → @Controller('cats') 路由匹配
    → CatsController.findAll() 被调用
      → this.catsService.getCats()
        → CatsService.getCats()
          → 返回 ['Tom', 'Garfield', 'Kitty']
        → 返回给 Controller
      → Nest 封装成 JSON 响应
    → 浏览器显示 ["Tom","Garfield","Kitty"]
```

---

## 小结

| 概念 | 说明 |
|------|------|
| Module | 组织代码的单元，封装一组 Controller + Service |
| Controller | 处理 HTTP 请求和响应 |
| Service | 写业务逻辑，可被 Controller 或其他 Service 注入 |
| `@Injectable()` | 标记类可被 Nest 容器管理 |
| 依赖注入 | 在 constructor 中声明依赖，Nest 自动提供实例 |
| `exports` | 让模块内的 Service 可被其他模块注入 |
| `imports` | 引入其他模块，使用其导出的 Service |

