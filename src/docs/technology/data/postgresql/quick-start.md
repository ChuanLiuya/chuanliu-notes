# PostgreSQL 快速上手

## 用 Docker 启动

```bash
docker run -d --name pg \
  -e POSTGRES_PASSWORD=123456 \
  -p 5432:5432 \
  postgres:16
```

默认会创建超级用户 `postgres` 和同名数据库 `postgres`。

## 连接

```bash
docker exec -it pg psql -U postgres
```

常用命令：

```sql
\l          -- 列出数据库
\c demo     -- 切换数据库
\dt         -- 列出表
\d users    -- 查看表结构
\q          -- 退出
```

创建数据库和用户：

```sql
CREATE DATABASE demo;
CREATE USER app WITH PASSWORD 'app123456';
GRANT ALL PRIVILEGES ON DATABASE demo TO app;
```

## Python 连接

FastAPI + SQLAlchemy 异步模式下用 `asyncpg` 驱动：

```text
postgresql+asyncpg://app:app123456@localhost:5432/demo
```

详见 [数据库连接](/technology/languages/Python/sqlalchemy)。

## 快速导航

- [PostgreSQL 是什么](/technology/data/postgresql/what-is-postgresql)
