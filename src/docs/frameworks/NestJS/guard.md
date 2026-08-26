# 守卫（Guard）

> 守卫负责权限校验，决定请求能否继续。返回 `true` 放行，返回 `false` 或抛异常则阻止。

## 是什么

守卫在中间件之后、拦截器之前执行，用来验证用户是否有权限访问特定路由。典型场景：

- JWT 鉴权（有没有登录）
- 角色校验（是不是管理员）
- 权限校验（能不能删这条帖子）

## 执行顺序

**全局守卫 → 控制器守卫 → 路由守卫**

```ts
@UseGuards(Guard1, Guard2)        // ← 控制器级
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @UseGuards(Guard3)              // ← 路由级
  @Get()
  getCats(): Cats[] {
    return this.catsService.getCats();
  }
}
```

`Guard1` 先于 `Guard2` 执行，两者都先于 `Guard3`。同级别用 `@UseGuards(A, B)` 时，从左到右依次执行。

## 三个级别

| 级别 | 写法 | 作用范围 |
|------|------|---------|
| 全局 | `app.useGlobalGuards(new AuthGuard())` | 所有路由 |
| 控制器 | `@UseGuards(AuthGuard)` 在 class 上 | 该控制器所有路由 |
| 路由 | `@UseGuards(AuthGuard)` 在方法上 | 仅该路由 |

## 基本用法

```ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // 从请求中提取 token 并验证
    return !!request.headers.authorization; // true 放行，false 阻止
  }
}
```

**`canActivate()` 返回值**：

| 返回值 | 效果 |
|--------|------|
| `true` | 放行，继续后续流程 |
| `false` | 阻止，Nest 抛出 `ForbiddenException`（403） |
| 抛出异常 | 直接进入异常过滤器（可自定义 401/403 等） |

## 与 Strategy 的关系

Guard 是门卫（决定能不能进），Strategy 是鉴定师（怎么验证身份）。实际认证流程见：

📖 [Guard 与 Strategy 详解](/frameworks/NestJS/auth-guard-strategy)
