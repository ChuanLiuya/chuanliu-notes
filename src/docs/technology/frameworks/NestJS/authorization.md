# 身份认证与授权

使用guard守卫来做权限管理。

在Nest的执行顺序中，守卫处于中间件middleware之后，拦截器interceptor之前。

## 什么是身份认证？

懒得写。这都不知道吗？

## 第一步：安装所需库



```bash
npm i @nestjs/passport passport

npm i @nestjs/jwt passport-jwt

npm i @types/passport-jwt -D
```

<CardGroup>

<CollapseCard title="passport" summary='身份验证的"工具箱"'>

Passport.js 是 Node.js 生态中最流行的身份验证库。它本身不干具体的活，而是提供了一套**统一的插拔机制**：你想用账号密码登录？装个策略。你想用 GitHub 扫码登录？再装个策略。所有策略都遵循同一套写法，换策略不换架构。

**没有它，你得这样写：**

```ts
// 每个接口都要手动做登录校验，没有统一机制
@Controller("user")
export class UserController {
  @Get("profile")
  getProfile(@Req() req: Request) {
    // 手动从 session 里抠用户信息
    if (!req.session || !req.session.userId) {
      throw new UnauthorizedException("请先登录");
    }
    // 手动查数据库
    const user = this.userService.findById(req.session.userId);
    // 手动序列化（去掉密码等敏感字段）
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
// 问题是：每个接口都得复制粘贴这段逻辑，
// 而且只支持 session，想换成 JWT？全部重写。
```

**有了它：**

```ts
// passport 提供统一的"策略"机制，换登录方式只换策略名
@UseGuards(AuthGuard('jwt'))  // 想换 local/github？改个字符串就行
@Get('profile')
getProfile(@Req() req: Request) {
  return req.user;  // passport 自动挂载的，无需手动处理
}
```

</CollapseCard>

<CollapseCard title="@nestjs/passport" summary="把 Passport 工具箱搬进 NestJS">

Passport 是为 Express 设计的，直接用在 NestJS 里会水土不服（NestJS 有自己的依赖注入、模块系统）。这个包做的事情就是把 Passport 的"插座"改造成适配 NestJS 的"插座"，让你能用 `@UseGuards(AuthGuard('xxx'))` 这种声明式写法。

**没有它，你得这样写：**

```ts
// passport 原生的 Express 中间件写法，在 NestJS 里只能用函数式中间件
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 只能以 Express 中间件方式挂载 passport，无法参与 NestJS 的 DI
  app.use(passport.initialize());
  app.use(passport.session());
}
```

```ts
// 在 NestJS 控制器里，只能用原生 req 对象，拿不到类型推断
@Controller("auth")
export class AuthController {
  @Post("login")
  login(@Req() req: any, @Res() res: any) {
    // passport 的 authenticate 方法返回的是 Express 中间件回调风格
    passport.authenticate("local", (err, user, info) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(401).json({ message: info.message });
      // 手动处理登录成功后的逻辑...
    })(req, res);
  }
}
// 问题：全是 any 类型、回调地狱、无法注入 NestJS 的 service、
// 无法用 NestJS 守卫做声明式鉴权
```

**有了它：**

```ts
// NestJS 风格：守卫 + 装饰器 + 依赖注入，一切优雅
@Controller("auth")
export class AuthController {
  @UseGuards(LocalAuthGuard) // 声明式守卫
  @Post("login")
  login(@Req() req: Request) {
    return this.authService.login(req.user); // 可以注入 AuthService
  }
}
```

</CollapseCard>

<CollapseCard title="passport-jwt" summary='一个具体的"策略插件"：验证 JWT 是否有效'>

它是 Passport 的其中一个策略（plugin）。功能很单一：从请求头里取出 token，用密钥验证签名，解析出里面的用户信息，挂到 `request.user` 上。它**只负责验证**，不负责生成 token。

**没有它，你得这样写：**

```ts
// 每个需要鉴权的接口，都要重复这段"从 header 取token→验签→查用户"
@Controller("posts")
export class PostsController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  @Get()
  async findAll(@Req() req: Request) {
    // 第1步：手动从 Header 取 token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("缺少 token");
    }
    const token = authHeader.split(" ")[1];

    // 第2步：手动验证 token
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException("token 无效或已过期");
    }

    // 第3步：手动查用户
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException("用户不存在");
    }

    // 第4步：终于可以写业务逻辑了
    return this.postsService.findAll();
  }
  // 问题：上面十几行样板代码，每个需要鉴权的方法都得复制一遍
}
```

**有了它：**

```ts
// passport-jwt 自动完成"取token→验签→查用户"，你只需声明一句
@Controller("posts")
export class PostsController {
  @UseGuards(AuthGuard("jwt")) // 这一行替代上面所有样板代码
  @Get()
  findAll(@Req() req: Request) {
    // req.user 已经挂好了当前用户，直接写业务逻辑
    return this.postsService.findAll();
  }
}
```

</CollapseCard>

<CollapseCard title="@nestjs/jwt" summary='JWT 的"生成器 + 配置中心"'>

它封装了 `jsonwebtoken` 库，提供两个核心能力：① `JwtModule.register({ secret, expiresIn })` 一次性注册密钥和过期时间；② `JwtService.sign()` / `JwtService.verify()` 来生成和验证 token。注意它和 `passport-jwt` 的分工：**@nestjs/jwt 管生成，passport-jwt 管验证**。

**没有它，你得这样写：**

```ts
// 手动管理密钥配置，到处散落
import * as jwt from "jsonwebtoken";

@Injectable()
export class AuthService {
  // 密钥散落在代码里，改一个地方容易漏
  private readonly secret = process.env.JWT_SECRET || "fallback-secret";

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) throw new UnauthorizedException("账号或密码错误");

    // 每次都要手动传 secret、expiresIn，容易写错
    const token = jwt.sign(
      { sub: user.id, username: user.username },
      this.secret,
      { expiresIn: "7d" },
    );
    return { access_token: token };
  }

  // 想换个地方生成 token？secret 配置又要复制一份。
  // 想改过期时间？全局搜 "expiresIn" 一个个改。
}
```

**有了它：**

```ts
// ===== app.module.ts =====
JwtModule.register({
  secret: "my-secret-key", // 全局配置一次
  signOptions: { expiresIn: "7d" }, // 全局过期时间
});

// ===== auth.service.ts =====
@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {} // 直接注入

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    // 一句搞定，secret/expiresIn 都是模块级配置，无需关注
    const token = this.jwtService.sign({
      sub: user.id,
      username: user.username,
    });
    return { access_token: token };
  }
}
```

</CollapseCard>

</CardGroup>

**一句话总结四者关系：**

`passport` 是身份验证的底座框架；`@nestjs/passport` 是它的 NestJS 适配器；`passport-jwt` 是底座上的一个"JWT 验证插件"；`@nestjs/jwt` 是独立的 JWT 工具包，负责生成 token 和配置管理。四者缺一不可。

## 第二步：登录时生成token密钥

1. 首先创建jwt模块
通常会放在auth.module里面。

``` ts
// auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'your-secret-key',     // 建议使用环境变量
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],            // 如果其他模块需要验证 token
})
export class AuthModule {}
```
::: warning
请务必在**环境变量**中配置你的密钥！
:::

2. 在auth.service里实现登录逻辑，验证用户名密码后签发token

``` ts
// auth.controller.ts
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.authService.validateUser(body.username, body.password);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    return this.authService.login(user);
  }
}
```
``` ts
// auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<any> {
    // 这里应该查询数据库验证用户名和密码
    if (username === 'admin' && password === 'admin') {
      return { userId: 1, username: 'admin' };
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
```

此时访问 POST /auth/login 并且输入正确的用户名与密码，就会收到 access_token 。


## 第三步：访问时用token获取权限

1. 创建 JWT 策略（验证逻辑）
JWT 策略负责从请求中提取 token、验证有效性并将解析出的用户信息注入 request.user。

``` ts
// auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your-secret-key',  // 与签发时保持一致，建议环境变量
    });
  }

  async validate(payload: any) {
    // payload 是 token 解码后的内容（如 { sub: userId, username: ... }）
    // 这里可查询数据库验证用户是否存在，返回的对象会挂载到 request.user
    return { userId: payload.sub, username: payload.username };
  }
}
```
`jwtFromRequest：ExtractJwt.fromAuthHeaderAsBearerToken()`：从请求头中使用 Authorization 字段提取 JWT，并且期望格式为 Bearer 。

`ignoreExpiration`：false 不忽略 JWT 的过期时间，即如果令牌过期，将被视为无效。

`secretOrKey`：验证 JWT 的密钥

`validate`：可在validate函数中，做额外的自定义权限校验，例如检查用户状态。这里直接返回参数。

2. 创建jwt的守卫(guards)保护路由

``` ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

## **Guard 是怎么找到 Strategy 的？**

关键就在 `AuthGuard('jwt')` 这个 `'jwt'` 字符串。

Passport 内部维护了一个**策略注册表（strategy registry）**。当你写 `extends PassportStrategy(Strategy)` 时，`passport-jwt` 库会自动以 **`'jwt'`** 为名把策略注册到这张表里——这个名字是库内部写死的默认名称。

`AuthGuard('jwt')` 运行时做的事就是：去这张注册表里查名为 `'jwt'` 的策略，找到后调用它的 `validate` 方法。所以 Guard 和 Strategy 靠同一个字符串名字实现匹配。

## **完整链路**

```
请求进来
  → JwtAuthGuard 触发
    → AuthGuard('jwt') 去 Passport 注册表查 'jwt'
      → 找到 JwtStrategy（因为 PassportStrategy(Strategy) 已注册为 'jwt'）
        → 执行 super() 中的配置（从 header 取 token、验签）
        → 执行 JwtStrategy.validate(payload)
        → 返回值挂到 req.user
```

3. 然后在需要保护的路由上添加 @UseGuards(JwtAuthGuard)。

实例：
``` ts
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller('profile')
export class AppController {
  @UseGuards(JwtAuthGuard) // 这里用的是路由守卫
  @Get()
  getProfile(@Request() req) {
    return req.user;   // { userId: 1, username: 'admin' }
  }
}
```