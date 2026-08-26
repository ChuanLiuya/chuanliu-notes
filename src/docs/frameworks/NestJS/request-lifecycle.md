# 请求生命周期

## 概述

通常情况下，请求生命周期遵循以下流程：

1. 传入请求
2. [中间件](/frameworks/NestJS/middleware)
   - 2.1 全局绑定的中间件
   - 2.2 模块绑定的中间件
3. [守卫](/frameworks/NestJS/guard)
   - 3.1 全局守卫
   - 3.2 控制器守卫
   - 3.3 路由守卫
4. 拦截器（控制器前）
   - 4.1 全局拦截器
   - 4.2 控制器拦截器
   - 4.3 路由拦截器
5. 管道
   - 5.1 全局管道
   - 5.2 控制器管道
   - 5.3 路由管道
   - 5.4 路由参数管道
6. 控制器（方法处理器）
7. 服务（如存在）
8. 拦截器（请求后）
   - 8.1 路由拦截器
   - 8.2 控制器拦截器
   - 8.3 全局拦截器
9. 异常过滤器
   - 9.1 路由
   - 9.2 控制器
   - 9.3 全局
10. 服务器响应



## 中间件（Middleware）

**顺序**：全局中间件(比如用`app.use`绑定的中间件) → 模块中间件

**作用**：对原始请求/响应做预处理。

- 日志记录、CORS 头设置、身份令牌提取等
- 可以修改请求对象（如往 `req` 上挂载 `user`），但通常不关心业务数据
- 通过 `next()` 把控制权交给下一阶段

## 守卫（Guard）

**顺序**：全局守卫 → 控制器守卫 → 路由守卫

例如：

``` ts
@UseGuards(Guard1, Guard2)
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @UseGuards(Guard3)
  @Get()
  getCats(): Cats[] {
    return this.catsService.getCats();
  }
}
```
Guard1 会在 Guard2 之前执行，而二者都会在 Guard3 之前执行。

**职责**：权限/授权校验。返回 `true` 才能继续，否则抛出 `ForbiddenException`。

- 可以访问 `ExecutionContext`，拿到请求对象和即将调用的处理器信息
- 返回 `false` → 直接进入异常过滤流程，不会走到业务层

## 拦截器（控制器前）（Interceptor Pre）

**顺序**：全局拦截器 → 控制器拦截器 → 路由拦截器

拦截器在到达处理器**之前**可以：

- 转换/替换传入数据（如前端字段映射为 DTO 字段）
- 记录请求日志、缓存命中后直接返回
- 包裹处理函数实现环绕处理

通过 `next.handle()` 将改造后的数据传递下去。

## 管道（Pipes）

管道是**参数级别**的处理，负责数据转换与验证。遵循从全局到控制器再到路由绑定的标准顺序。对于 `@UsePipes()` 参数同样采用先进先出的原则。然而，在路由参数级别，如果有多个管道运行，它们将按照从最后一个带管道的参数到第一个参数的顺序执行。这也适用于路由级别和控制器级别的管道。例如，假设我们有如下控制器：
``` ts
@UsePipes(GeneralValidationPipe)
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @UsePipes(RouteSpecificPipe)
  @Patch(':id')
  updateCat(
    @Body() body: UpdateCatDTO,
    @Param() params: UpdateCatParams,
    @Query() query: UpdateCatQuery
  ) {
    return this.catsService.updateCat(body, params, query);
  }
}

```
那么 `GeneralValidationPipe` 会先对 `query` 执行验证，然后是 `params`，接着是 `body` 对象，最后才会执行 RouteSpecificPipe（遵循同样的顺序）。如果存在任何参数特定的管道，它们将在控制器和路由级别的管道之后运行（同样是从最后一个参数到第一个参数）。

典型流程：

1. 从请求上下文取出参数（如 `req.body`）
2. `class-transformer` 将 JS 对象实例化为 DTO 类实例
3. `class-validator` 根据装饰器规则进行校验
4. 失败 → 抛出 `BadRequestException`（400），进入异常过滤
5. 通过 → DTO 实例传入控制器方法

```ts
// 管道处理前：{ email: "a@b.com", age: "25" }
// 管道处理后：CreateUserDto { email: "a@b.com", age: 25 }
```

## 控制器方法（Controller Handler）

控制器拿到已验证和转换好的 DTO 实例，调用服务层方法。

- 控制器**只负责路由和参数绑定**，不包含业务逻辑
- 业务逻辑在 Service 中执行（数据库操作、外部 API 调用等）
- 返回值（对象、Promise / Observable）就是处理结果

## 8. 拦截器 - 后置（Interceptor Post）

拦截器截获控制器返回的结果（通过 `next.handle().pipe(map(...))`）。

典型作用：

- 统一响应格式（如 `{ code: 0, data: ... }`）
- 敏感字段脱敏
- 二次数据处理

**执行顺序与前置相反**：路由 → 控制器 → 全局。

## 异常过滤器（Exception Filters）

前面任意环节抛出异常 → 跳过正常流程 → 进入异常过滤器。

- **顺序**：路由 → 控制器 → 全局
- 默认过滤器将 Nest 异常转为标准 JSON 错误响应
- 自定义过滤器可统一错误格式、记录日志

::: tip
过滤器仅在请求过程中发生未捕获异常时才会执行。已捕获的异常（例如通过 try/catch 捕获的异常）不会触发异常过滤器。一旦遇到未捕获异常，请求将跳过剩余生命周期直接进入过滤器处理阶段。
:::
