# 数据库连接

本文档使用 **SQLAlchemy** 的异步模式连接 **PostgreSQL**，并在 **FastAPI** 里使用。数据库地址沿用上一节的 `pydantic-settings` 读取。

## 什么是 ORM

**ORM**（Object-Relational Mapping，对象关系映射），用python类来表示表，用类的属性表示表的一个字段。


## 安装

```bash
uv add "sqlalchemy[asyncio]" asyncpg
```

- `sqlalchemy[asyncio]`：ORM 本体，带上异步支持
- `asyncpg`：PostgreSQL 的**异步**驱动，SQLAlchemy 通过它发 SQL


## 数据库地址 DATABASE_URL


```text
postgresql+asyncpg://用户名:密码@主机:端口/数据库名
```

例如：

```bash
DATABASE_URL=postgresql+asyncpg://postgres:123456@localhost:5432/demo
```

::: tip

建议使用[环境变量](/technology/languages/Python/pydantic-settings)来设置数据库URL

:::


## 创建数据库引擎

```python
from sqlalchemy.ext.asyncio import create_async_engine

DATABASE_URL = "xxx"

async_engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    pool_size=10,
    max_overflow=20,
)

```

- `create_async_engine`：异步引擎创建函数，返回一个 AsyncEngine 实例。它本身不建立任何连接，只是创建了一个"连接池管理器"，真正的连接在第一次执行 SQL 时才懒创建。

- `DATABASE_URL`：数据库连接字符串，格式为 postgresql+asyncpg://user:password@host:port/dbname。中间的 +asyncpg 就是在告诉 SQLAlchemy 用哪个驱动。

- `echo=True`：打印实际执行的 SQL 语句到日志，用来调试。生产环境务必关掉，否则每条 SQL 都打日志，既慢又泄露敏感数据。

- `pool_size=10`：连接池里常驻保持的连接数。应用启动后池子里最多同时有 10 个空闲可用连接。

- `max_overflow=20`：连接池被占满后，允许临时额外创建的连接数。所以并发高峰时池子上限是 10 + 20 = 30 个连接，高峰过去后多出来的会被回收。

## 创建会话工厂

``` python
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)
```
引擎是连接池，但业务代码不直接操作连接，而是操作"会话（Session）"。Session 负责管理一次请求内的事务、身份映射、对象状态。

async_sessionmaker 是一个工厂，调用它就产出一个新的 AsyncSession。

`AsyncSessionLocal` 里封装了创建 Session 所需的全部配置：绑哪个引擎（bind）、用哪个类（class_=AsyncSession）、这些东西是全局一份、长期不变的。而 Session 是一次请求用完就扔的短命对象。`AsyncSessionLocal`就是一个预先配置好的Session 生产器，只负责一件事：每次被调用，就给你一个按既定配置初始化好的、全新的 `AsyncSession`。
- `bind=async_engine`：告诉工厂从哪个池子拿连接。
- `class_=AsyncSession`：显式指定产出异步会话（不写通常也能推断，写上更明确）。
- `expire_on_commit=False`：硬性要求。默认 True 会在 commit 后把所有对象标记为过期，下次访问属性触发懒加载重查，异步下直接抛 MissingGreenlet。

## 继承基础表


```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    id: Mapped[int] = mapped_column()
    pass

```


`Base` 是所有 ORM 模型的共同父类，继承`SQLAlchemy`的`DeclarativeBase`。他会收集所有模型定义的表的信息，供建表使用。`Base`本身不对应一个表。然后这个`Base`可以定义所有表都有的字段，像`id`,`create_time`,`update_time`等。

```python
async with engine.begin() as conn:
    await conn.run_sync(Base.metadata.create_all)
```

::: warning
`create_all` 只会「建不存在的表」，**不会修改已有表的结构**。表结构变更请用 Alembic 做迁移。
:::

## 异步 Session

用 `async_sessionmaker` 建一个工厂：

```python
from sqlalchemy.ext.asyncio import async_sessionmaker

SessionLocal = async_sessionmaker(engine, expire_on_commit=False)
```

- `expire_on_commit=False`：**必须设置**。默认 `commit()` 后对象的属性会过期，异步里再去访问会抛 `MissingGreenlet`（因为它需要偷偷发一次同步查询）。设成 `False` 后，commit 之后对象仍然可读。
- `SessionLocal` 只是工厂，每次需要时创建新 session，用完关闭。

```python
async with SessionLocal() as session:
    user = User(name="tom", email="tom@example.com")
    session.add(user)   # 放入待提交队列（同步方法，不用 await）
    await session.commit()  # 真正写库
    print(user.id)      # commit 之后才有数据库生成的主键
```

## 在 FastAPI 里使用

### 用依赖注入提供 session

```python
from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session


DbSession = Annotated[AsyncSession, Depends(get_session)]
```

`async with` 保证请求结束（包括抛异常）时 session 一定会关闭并归还连接。

### 在路由里直接用

```python
from fastapi import APIRouter

from app.models import User
from app.deps import DbSession

router = APIRouter()


@router.get("/users")
async def list_users(db: DbSession):
    users = await db.scalars(select(User))
    return users.all()
```

### 应用关闭时释放连接池

```python
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.database import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await engine.dispose()   # 关闭连接池，避免重启时残留连接


app = FastAPI(lifespan=lifespan)
```

## 增删改查

### 查

```python
from sqlalchemy import select

async with SessionLocal() as session:
    # 按主键取一个
    user = await session.get(User, 1)

    # 条件查询，取第一条
    user = await session.scalar(select(User).where(User.email == "tom@example.com"))

    # 列表
    users = (await session.scalars(select(User).order_by(User.id.desc()))).all()
```

- `session.get` / `session.scalar` / `session.scalars` / `session.execute` 都是**协程**，必须 `await`
- `scalars()` 表示「只取第一列（也就是对象本身）」，不加它拿到的是 `Row` 元组
- `.all()` / `.first()` 是拿结果之后的普通同步方法，**不要** `await`

### 改

当前 session 里的对象被改过，`commit()` 会自动发 `UPDATE`：

```python
async with SessionLocal() as session:
    user = await session.get(User, 1)
    user.name = "jerry"
    await session.commit()
```

### 删

```python
async with SessionLocal() as session:
    user = await session.get(User, 1)
    await session.delete(user)
    await session.commit()
```

## 表和表的关系（异步要注意预加载）

一对多：一个用户有多篇文章。

```python
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(100))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    author: Mapped["User"] = relationship(back_populates="posts", lazy="selectin")
```

再在 `User` 里补一行：

```python
    posts: Mapped[list["Post"]] = relationship(back_populates="author", lazy="selectin")
```

::: warning
异步里默认的懒加载（`lazy="select"`）在访问 `user.posts` 时会抛 `MissingGreenlet`。所以要么在 `relationship` 上写 `lazy="selectin"`（查主对象时顺带查出来），要么查询时显式预加载：

```python
from sqlalchemy.orm import selectinload

user = await session.scalar(
    select(User).where(User.id == 1).options(selectinload(User.posts))
)
```
:::

## 常见坑

| 现象                             | 原因                                                          |
| -------------------------------- | ------------------------------------------------------------- |
| `MissingGreenlet`                | 异步里做了同步 IO：忘了 `await`、懒加载关系、`expire_on_commit` 没关 |
| `InvalidRequestError`（驱动相关）| URL 里写成了 `postgresql+psycopg://`，异步要用 `postgresql+asyncpg://` |
| `connection refused`             | PostgreSQL 没启动，或主机/端口写错                            |
| `password authentication failed` | 用户名密码错；密码含 `@ : /` 等字符要先做 URL 编码             |
| `ModuleNotFoundError: asyncpg`   | 忘了装驱动，`sqlalchemy` 本身不带驱动                         |
| 改了模型表没变                   | `create_all` 不改表，需手动改表或用 Alembic                   |
| 结果不是对象而是元组             | 忘了 `.scalars()`                                             |
| 数据没保存                       | 忘了 `await session.commit()`                                 |
