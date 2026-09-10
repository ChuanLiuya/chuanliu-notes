<script setup lang='ts'>
import WipTag from '@components/WipTag.vue'
</script>

# 中间件（Middleware）

> 中间件是请求到达 Controller 之前执行的前置拦截，用于日志、跨域、令牌提取等底层处理。

## 中间件是什么

中间件是一个在请求到达 Controller **之前**执行的函数。可以用来：

- 记录请求日志
- 验证请求头（如 token）
- 往 `req` 上挂载额外数据

它和 Express 的中间件一样，签名为 `(req, res, next)`，必须手动调用 `next()` 才能放行。

## 如何编写日志中间件

`src/common/middleware/logger.middleware.ts`：

```ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`[Request] ${req.method} ${req.originalUrl}`);
    next(); // ← 必须调用，否则请求卡住
  }
}
```

## 如何应用中间件

在模块中通过 `configure()` 注册：

```ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from '../common/middleware/logger.middleware';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('cats'); // 只拦截 /cats 路由
  }
}
```

`.forRoutes()` 可以精确控制范围：

```ts
.forRoutes(CatsController);                              // 整个控制器
.forRoutes({ path: 'cats', method: RequestMethod.GET }); // 只拦截 GET /cats
.forRoutes('*');                                         // 所有路由（全局中间件）
```

::: tip 中间件 vs Guard
中间件更底层（Express 原生），能做请求/响应对象的任意操作。Guard 是 Nest 层的，专门做鉴权。能 Guard 解决的就用 Guard，中间件留给日志、跨域等底层需求。
:::

## 应用中间件的范围

### 全局

如果我们需要一次性将中间件绑定到所有已注册的路由，可以使用 `INestApplication` 实例提供的 `use()` 方法：

```ts
const app = await NestFactory.create(AppModule);
app.use(logger);
await app.listen(process.env.PORT ?? 3000);
```
`app.use()`  `forRoutes('*')`两种方式都能实现"全局中间件"，但有关键区别——**能否使用依赖注入**。

#### 方式一：`app.use()` — 不能用 DI

```ts
// main.ts
const app = await NestFactory.create(AppModule);
app.use(new LoggerMiddleware()); // ← 你自己 new，Nest 不管
```

`app.use()` 是 Express 原生的方法，在 Nest 的 IoC 容器之外执行。你传进去的中间件需要你自己 `new`，constructor 参数也得自己传：

```ts
// 这样不行，Nest 不会帮你注入
class LoggerMiddleware implements NestMiddleware {
  constructor(private catsService: CatsService) {} // 拿不到！
  use(req, res, next) { ... }
}
app.use(new LoggerMiddleware(???)); // 你得手动传 CatsService
```

#### 方式二：`forRoutes('*')` — 可以用 DI

```ts
// app.module.ts
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)  // ← Nest 帮你 new，自动注入依赖
      .forRoutes('*');          // ← 等同于全局
  }
}
```

中间件在模块上下文中运行，constructor 里的依赖正常注入：

```ts
// ✅ 可行
class LoggerMiddleware implements NestMiddleware {
  constructor(private catsService: CatsService) {} // 能拿到！
  use(req, res, next) { ... }
}
```

#### 方式三：函数式中间件（折中）

不需要依赖注入时，不写类，直接写函数：

```ts
const logger = (req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  next();
};

// main.ts
app.use(logger); // 直接传函数，简单场景够用
```

#### 总结

| 方式 | 能用 DI 吗 | 适合场景 |
|------|:--:|------|
| `app.use()` | ❌ | 纯函数中间件，不需要注入 Service |
| `forRoutes('*')` | ✅ | 类中间件，需要在 constructor 里注入依赖 |
| 函数式中间件 | ❌ | 简单日志、跨域等 |



### 其他范围 <WipTag />

待完善。