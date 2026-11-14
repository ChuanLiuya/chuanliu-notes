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

## 测试连接

引擎建好、还没写模型之前，先单独确认一次"能不能连上库"。新建 `test_db.py`，从引擎所在的模块（假设引擎写在 `app/database.py` 里）导入 `async_engine`：

```python
# 根目录/tests/test_db.py
import asyncio
import sys

from app.main import async_engine

async def test_db_connection():
    try:
        async with async_engine.connect() as conn:
            pass
        print("数据库连接建立成功")
    except Exception as e:
        print(f"连接失败: {e}")
        sys.exit(1)

def main():
    asyncio.run(test_db_connection())

if __name__ == "__main__":
    main()
```

``` toml
# 根目录/pyproject.toml
[build-system]
requires = ["uv_build>=0.13.8,<0.14.0"]
build-backend = "uv_build"

[tool.uv.build-backend]
module-root = ""    # 将模块根目录设为空
module-name = "app" # 显式指定包名为 app

[project.scripts]
test_db = "tests.test_db:main"

```

跑一下：

```bash
uv run test_db
```

::: tip
`create_async_engine` 是惰性的：创建引擎时根本不连数据库，所以"建完引擎没报错"不代表能连上。这一步才是第一次真正握手。
:::

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

工厂建好后，业务代码这样用：

```python
async with AsyncSessionLocal() as session:
    user = User(name="tom", email="tom@example.com")
    session.add(user)       # 同步方法，不用 await
    await session.commit()  # 真正写库
    print(user.id)          # commit 之后才有数据库生成的主键
```

::: tip
`AsyncSessionLocal` 只是生产 Session，同样不会连库；Session 第一次执行 SQL 时才从连接池取连接。
:::

## 编写基础表内容


```python
from datetime import datetime

from sqlalchemy import DateTime
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, sort_order=-1, comment="主键ID")
    create_time: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.now, comment="创建时间")


```


- `Base` 是所有 ORM 模型的共同父类，继承`SQLAlchemy`的`DeclarativeBase`。他会收集所有模型定义的表的信息，供建表使用。`Base`本身不对应一个表。然后这个`Base`可以定义所有表都有的字段，像`id`,`create_time`,`update_time`等。
- `datetime.now` 不要加括号，表示把函数交给SQLalchemy，在插入记录且未提供创建时间时，调用这个函数。如果加了括号，就会在导入模块时提前计算好，后续插入全是这个时间。
```python
async with async_engine.begin() as conn:
    await conn.run_sync(Base.metadata.create_all)
```

::: warning
`create_all` 只会「建不存在的表」，**不会修改已有表的结构**。表结构变更请用 Alembic 做迁移。
:::
## 编写分类表与商品表内容

``` python
class Category(Base):
    __tablename__ = "categories"
    __table_args__ = {"comment": "商品分类表"}

    name: Mapped[str] = mapped_column(String(50), nullable=False, unique=True, comment="分类名称")

    
class Product(Base):
    __tablename__ = "products"
    __table_args__ = {"comment": "商品表"}

    name: Mapped[str] = mapped_column(String(50), nullable=False, comment="商品名称")
    category_id : Mapped[int] = mapped_column(ForeignKey("categories.id"),nullable=True, comment="分类所属ID")
    price: Mapped[Decimal] = mapped_column(Numeric(8,2), nullable=False, comment="商品单价(元)")
    stock: Mapped[int] = mapped_column(nullable=True, default=0,comment="库存数量")
    shelf_status: Mapped[bool] = mapped_column(Boolean, nullable=False,default=True, comment="是否上架")
```
## 创建表

``` python
import asyncio
from app.database.database import Base, async_engine

async def create_tables() -> None:
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def drop_tables() -> None:
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


def main() -> None:
    asyncio.run(create_tables())
    print("建表完成")


if __name__ == "__main__":
    main()

```
