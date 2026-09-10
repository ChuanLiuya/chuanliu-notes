# 构建 RESTful API：路由、DTO 与请求处理

> 本篇学习如何构建完整的 RESTful API——路由装饰器、DTO 数据校验、ValidationPipe 全局管道。

---

## 完整 CRUD API

继续在 `cats` 模块上扩展，构建完整的增删改查接口。

目录结构：

```
src/
└── cats/
    ├── cats.module.ts
    ├── cats.service.ts
    ├── cats.controller.ts
    └── dto/
        └── create-cat.dto.ts
```

---

## 创建 DTO

DTO（Data Transfer Object）用于定义请求数据的结构和类型。Nest 推荐用 `class-validator` 装饰器做校验。

```bash
npm install class-validator class-transformer
```

`src/cats/dto/create-cat.dto.ts`：

```ts
import { IsString, IsInt } from 'class-validator';

export class CreateCatDto {
  @IsString()
  name: string;

  @IsInt()
  age: number;

  @IsString()
  breed: string;
}
```

**装饰器说明**：

| 装饰器 | 作用 |
|--------|------|
| `@IsString()` | 必须是字符串 |
| `@IsInt()` | 必须是整数 |
| `@IsOptional()` | 可选字段 |
| `@IsEmail()` | 必须是邮箱格式 |
| `@Min(n)` / `@Max(n)` | 数值范围 |
| `@Length(min, max)` | 字符串长度 |

---

## 控制器：完整 REST API

`cats.controller.ts`：

```ts
import {
  Controller, Get, Post, Put, Delete,
  Body, Param,
} from '@nestjs/common';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  create(@Body() dto: CreateCatDto) {
    return this.catsService.create(dto);
  }

  @Get()
  findAll() {
    return this.catsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catsService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.catsService.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.catsService.remove(+id);
  }
}
```

**常用参数装饰器**：

| 装饰器 | 作用 | 示例 |
|--------|------|------|
| `@Body()` | 获取 POST/PUT 请求体 | `@Body() dto: CreateCatDto` |
| `@Param('id')` | 获取路径参数 `/cats/:id` | `@Param('id') id: string` |
| `@Query()` | 获取查询参数 `?q=xxx` | `@Query('q') q: string` |
| `@Headers()` | 获取请求头 | `@Headers('token') token: string` |

::: warning 不推荐用 @Req()
`@Req()` 能拿到完整 Request 对象，但会绕过 Nest 的类型系统和管道，破坏框架的抽象层。能用具体装饰器就用具体的。
:::

---

## 服务：模拟数据库操作

`cats.service.ts`（内存数组模拟）：

```ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class CatsService {
  private cats = [];

  create(cat: any) {
    const id = this.cats.length + 1;
    const newCat = { id, ...cat };
    this.cats.push(newCat);
    return newCat;
  }

  findAll() {
    return this.cats;
  }

  findOne(id: number) {
    return this.cats.find((cat) => cat.id === id);
  }

  update(id: number, data: any) {
    const cat = this.findOne(id);
    if (cat) {
      Object.assign(cat, data);
    }
    return cat;
  }

  remove(id: number) {
    this.cats = this.cats.filter((cat) => cat.id !== id);
    return { deleted: true };
  }
}
```

---

## 启用全局验证管道

`main.ts` 中加一行：

```ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe()); // ← 启用全局校验
  await app.listen(3000);
}
bootstrap();
```

**`ValidationPipe` 做了什么**：

1. 请求进来时，看 `@Body()` 参数的类型（如 `CreateCatDto`）
2. 自动把 JSON 转成 DTO 类的实例
3. 逐个检查装饰器（`@IsString()`、`@IsInt()` 等）
4. 不通过 → 自动返回 400 + 详细错误信息
5. 通过 → 继续执行 Controller 方法

::: tip 默认行为
`ValidationPipe` 默认会**剔除 DTO 中未定义的字段**（白名单模式），防止客户端传入恶意字段。
:::

---

## 接口测试

**创建猫**：

```http
POST /cats
Content-Type: application/json

{
  "name": "喵喵",
  "age": 2,
  "breed": "波斯猫"
}
```

**获取所有猫**：

```http
GET /cats
```

**获取某一只**：

```http
GET /cats/1
```

**更新**：

```http
PUT /cats/1
Content-Type: application/json

{ "age": 3 }
```

**删除**：

```http
DELETE /cats/1
```

---

## 一个请求的完整路径（以 POST 为例）

```
客户端: POST /cats  { name: "喵喵", age: 2, breed: "波斯猫" }
  → ValidationPipe 校验 DTO
    → @IsString() name ✅
    → @IsInt() age ✅
    → @IsString() breed ✅
    → 校验通过，剔除多余字段
  → CatsController.create(@Body() dto)
    → this.catsService.create(dto)
      → 内存数组 push
      → 返回 { id: 1, name: "喵喵", age: 2, breed: "波斯猫" }
    → Nest 封装成 JSON 响应
  → 客户端收到 201 + JSON
```

---

## 小结

| 概念 | 说明 |
|------|------|
| DTO | 用 class + 装饰器定义请求数据结构 |
| `@Body()` / `@Param()` / `@Query()` | 从不同位置提取请求参数 |
| `class-validator` | 声明式校验（`@IsString`、`@IsInt` 等） |
| `ValidationPipe` | 全局启用自动校验，不通过自动 400 |
| REST 风格 | `@Get()` / `@Post()` / `@Put()` / `@Delete()` |

