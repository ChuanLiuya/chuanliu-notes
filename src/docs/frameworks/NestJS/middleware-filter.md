# 异常过滤器（Exception Filters）

> 统一捕获和处理异常，返回规范的错误响应格式。

## 异常过滤器（Exception Filters）

### 默认行为

Nest 遇到异常时会自动返回 JSON：

```json
{
  "statusCode": 400,
  "message": "some error",
  "error": "Bad Request"
}
```

但实际项目通常需要**统一的错误响应格式**，比如加 `success` 字段、时间戳等。

### 编写自定义异常过滤器

`src/common/filters/http-exception.filter.ts`：

```ts
import {
  ExceptionFilter, Catch, ArgumentsHost, HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
```

**逐行解释**：

| 代码 | 作用 |
|------|------|
| `@Catch(HttpException)` | 只捕获 Nest 的 HTTP 异常，不处理其他类型错误 |
| `host.switchToHttp()` | 从 Nest 通用上下文中拿到 HTTP 的 req/res |
| `exception.getStatus()` | 获取 HTTP 状态码（400/401/404 等） |
| `exception.message` | 获取异常消息 |

### 应用异常过滤器

**方法级**（只对这一个路由生效）：

```ts
@Post()
@UseFilters(HttpExceptionFilter)
create(@Body() dto: CreateCatDto) {
  throw new BadRequestException('手动抛出异常示例');
}
```

**控制器级**（整个控制器生效）：

```ts
@UseFilters(HttpExceptionFilter)
@Controller('cats')
export class CatsController {}
```

**全局注册**（推荐，一劳永逸）：

```ts
// main.ts
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter()); // ← 全局应用
  await app.listen(3000);
}
```

::: tip 依赖注入的问题
`useGlobalFilters()` 注册的过滤器不在模块上下文内，无法注入依赖。如果需要注入 Service，改用 APP_FILTER 提供者：

```ts
// app.module.ts
providers: [
  { provide: APP_FILTER, useClass: HttpExceptionFilter },
]
```
:::

---

> 中间件和异常过滤器在请求生命周期中的位置，详见 [请求生命周期](/frameworks/NestJS/request-lifecycle) 专题。

---

## 小结

| 概念 | 一句话 | 注册方式 |
|------|--------|---------|
| 中间件 | 请求进入 Controller 前的 hook | `configure()` 在模块中 |
| 异常过滤器 | 统一错误响应格式 | `@UseFilters()` 或 `useGlobalFilters()` |
| `next()` | 中间件必须调用才能放行 | 忘了调用 → 请求卡死 |
| `host.switchToHttp()` | 从通用上下文拿到 HTTP 的 req/res | 过滤器里必用 |

**下一篇预告**：拦截器（Interceptors）—— 请求响应的统一转换。
