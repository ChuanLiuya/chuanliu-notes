# 快速上手

## 1. 安装nest cli

``` bash
npm i -g @nest/cli

```

安装成功后，可以使用nest命令查看是否安装成功

```bash
nest --version
nest -v
```

## 2. 创建项目

``` bash
nest new my-nest-project-name # 输入nest new xxx创建项目
✨  We will scaffold your app in a few seconds.. 

? Which package manager would you ❤️  to use? # 然后会提示选哪个工具
> npm # 选自己用的包管理工具，我用的是npm
  yarn
  pnpm

↑↓ navigate • ⏎ select
▹▹▹▸▹ Installation in progress... ☕ #稍微等待一会


🚀  Successfully created project mypro
👉  Get started with the following commands:


# 若看到如下文本则创建成功！
$ cd mypro
$ npm run start


                          Thanks for installing Nest 🙏
                 Please consider donating to our open collective
                        to help us maintain this package.


               🍷  Donate: `https://opencollective.com/nest`
```
## 3. 运行项目

进入项目目录，然后运行：
``` bash
npm run start

```

默认监听端口是 `http://localhost:3000`，你将会看到：

``` 
[Nest] 2025   - Nest application successfully started

```

输入地址 `http://localhost:3000`，将看到：

``` 
Hello World!

```

## 附录：项目结构拆解

### `main.ts` — 应用入口文件

Nest 应用从这里启动。逐行拆解：

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

#### 逐行解释

**`import { NestFactory } from '@nestjs/core'`**

从 NestJS 核心包里引入 `NestFactory`。它是一个**工厂函数**，用来创建 Nest 应用实例。

**`import { AppModule } from './app.module'`**

引入项目根模块 `AppModule`。Module 是 Nest 的"组装蓝图"，里面声明了有哪些 Controller、Service 等。

**`async function bootstrap()`**

一个异步函数，`async` 是因为创建应用的过程涉及 I/O 操作（读配置、连数据库等）。

> 函数名叫 `bootstrap` 是惯例（"自举"的意思），不是 Nest 规定的，你可以叫 `start`、`main` 都行。

**`const app = await NestFactory.create(AppModule)`**

核心一步：用 `NestFactory` 根据 `AppModule` 的蓝图创建出整个应用实例。

这背后 Nest 做了这些事：
1. 扫描 `AppModule` 及其 imports 的所有模块
2. 解析所有 Controller、Provider（Service）的依赖关系
3. 实例化所有类（依赖注入自动完成）
4. 建立路由映射（哪个 URL 走哪个 Controller）
5. 挂载全局管道、拦截器、过滤器

**`await app.listen(3000)`**

启动 HTTP 服务器，监听 3000 端口。程序开始等待外部请求。

**`bootstrap()`**

**调用**上面定义的函数，真正开始执行。没有这一行，什么都不会发生。

---

### `app.module.ts` — 根模块

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

#### 逐行解释

**`@Module({...})`**

`@Module` 是一个**装饰器**（Decorator），它告诉 Nest："这个类是一个模块"。花括号里的配置就是模块的"成员清单"。

**`imports: []`**

引入**其他模块**的地方。当前是空数组，表示这个模块不依赖其他模块。等后面加了数据库、用户系统等，就会在这里 `imports: [TypeOrmModule, UsersModule]`。

**`controllers: [AppController]`**

注册**控制器**。Controller 负责接收 HTTP 请求、返回响应，相当于 API 的"门面"。

> 类比：`controllers` 是"服务员"——客人点什么菜、问什么问题，都先找服务员。服务员不炒菜（不写业务逻辑），只负责接待和传话。

**`providers: [AppService]`**

注册**提供者**（通常是 Service）。Provider 是真正干活的——写业务逻辑、查数据库、计算数据。Nest 的依赖注入会把它们自动注入到需要的地方。

> 类比：`providers` 是"后厨"——服务员把客人点的菜告诉后厨，后厨负责炒菜（执行业务逻辑）、从冰箱拿食材（查数据库）。

**`export class AppModule {}`**

导出这个模块类，让 `main.ts` 里的 `NestFactory.create(AppModule)` 能用。

---

### `app.controller.ts` — 控制器（服务员）

```ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

#### 逐行解释

**`@Controller()`**

声明这是一个控制器。括号里可以传路径前缀，比如 `@Controller('users')` 表示这个控制器下的所有路由都以 `/users` 开头。这里为空，表示匹配根路径 `/`。

**`constructor(private readonly appService: AppService) {}`**

这是 TypeScript 的**参数属性**语法。写在 constructor 参数里，Nest 会自动把 `AppService` 的实例注入进来，同时声明为私有只读属性。等价于：

```ts
private readonly appService: AppService;

constructor(appService: AppService) {
  this.appService = appService;
}
```

**`@Get()`**

声明这个方法处理 **GET 请求**。括号里可以传具体路径，比如 `@Get('profile')` 匹配 `GET /profile`。这里为空，匹配 `GET /`。

类似的装饰器还有 `@Post()`、`@Put()`、`@Delete()`、`@Patch()`。

**`getHello(): string`**

普通的方法，名字随便起。返回类型 `string` 表示响应是纯文本（Nest 默认会序列化为 JSON 或字符串）。

**`return this.appService.getHello()`**

**核心逻辑**：调用 Service 的方法获取数据，然后直接返回给客户端。

> 类比：服务员不亲自炒菜，ta 对后厨喊一句"来份 Hello World！"，后厨做好递给ta，ta 再端给客人。**Controller 对接请求和响应，Service 处理业务逻辑。**

---

### `app.service.ts` — 服务（后厨）

```ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```

#### 逐行解释

**`@Injectable()`**

声明这个类**可以被注入**。有了 `@Injectable()`，Nest 的 IoC 容器就能管理它的生命周期，并在 Controller 的 constructor 里自动注入。

::: tip 如果忘了写 @Injectable()
Nest 会报错：`AppService is not a provider` —— 相当于后厨没上岗证，服务员找不到人炒菜。
:::

**`export class AppService`**

普通的类，里面写业务逻辑。

**`getHello(): string`**

业务方法，返回 `'Hello World!'`。实际项目里这里可能是查数据库、调第三方 API、做数据计算等。

---

### 四者协作全景

```
┌─────────────────────────────────────────────┐
│                🌐 浏览器                      │
│         GET `http://localhost:3000`            │
└──────────────────┬──────────────────────────┘
                   │ HTTP 请求
                   ▼
┌─────────────────────────────────────────────┐
│              🍽️ Nest 应用                    │
│                                             │
│  📋 main.ts                                 │
│    NestFactory.create(AppModule)            │
│    → 按蓝图组装一切                          │
│         │                                   │
│         │ 根据蓝图                           │
│         ▼                                   │
│  📦 AppModule                               │
│    @Module({ controllers, providers })      │
│    → 声明有啥 Controller / Service          │
│         │                                   │
│    ┌────┴────┐                              │
│    │ 注册     │ 注册并提供                    │
│    ▼         ▼                              │
│  👨‍🍳        🍳                               │
│  AppController     AppService               │
│  @Controller()     @Injectable()            │
│  服务员            后厨                      │
│    │                │                       │
│    │  调用 getHello() │                      │
│    │───────────────→│                       │
│    │                │                       │
│    │  返回 'Hello World!'                   │
│    │◁───────────────│                       │
│    │                                       │
└────┼───────────────────────────────────────┘
     │ HTTP 响应 "Hello World!"
     ▼
┌──────────┐
│ 🌐 浏览器  │
└──────────┘
```

```
一个请求的完整生命：

浏览器输入 `http://localhost:3000`
  → 路由匹配到 @Get()（根路径）
    → AppController.getHello() 被调用
      → this.appService.getHello()（找后厨）
        → 返回 'Hello World!'
      → 返回给 Nest
    → Nest 封装成 HTTP 响应
  → 浏览器显示 "Hello World!"
```

| 文件 | 角色 | 类比 | 职责 |
|------|------|------|------|
| `main.ts` | 入口 | 餐厅建造商 | 创建并启动应用 |
| `app.module.ts` | 模块 | 组织架构图 | 声明有哪些 Controller/Service |
| `app.controller.ts` | 控制器 | 服务员 | 接收请求、返回响应（不写业务逻辑） |
| `app.service.ts` | 服务 | 后厨 | 执行业务逻辑、查数据库 |