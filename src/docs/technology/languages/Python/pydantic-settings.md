# 管理环境变量

本文档将使用 `pydantic-settings` 来管理环境变量。

## 安装

```bash
uv add pydantic-settings
```

::: tip 
`fastapi` 应该会自带这个包。
:::

## 最小示例

```text
demo/
├── .env
└── src/demo/
    ├── config.py
    └── main.py
```

`.env`：

```bash
APP_NAME=demo
DEBUG=true
DATABASE_URL=postgresql://user:pass@localhost:5432/demo
```
::: warning

别忘了把 `.env` 文件写入 `.gitignore` !

:::

`config.py`：

```python
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "demo"
    debug: bool = False
    database_url: str
    port: int = Field(default=8000, ge=1, le=65535)
```

`main.py`：

```python
from demo.config import Settings

settings = Settings()
print(settings.app_name)      # demo
print(settings.debug)         # True，字符串 "true" 已转成 bool
print(settings.database_url)  # postgresql://user:pass@localhost:5432/demo
print(settings.port)          # 8000
```

几件事同时发生了：

- 字段名自动对应同名环境变量（大小写不敏感）
- 字符串被转成 `bool`、`int` 等目标类型
- 没有环境变量时使用默认值；**必填字段缺失会直接抛 `ValidationError`**
- `Field` 上的 `ge` / `le` 等约束同样生效

缺少必填项时的报错会明确指出字段和来源：

```text
1 validation error for Settings
database_url
  Field required [type=missing, input_value={...}, input_type=dict]
```

::: warning
`Settings()` 在**实例化时**读取配置，之后再改环境变量不会影响已有实例。一般在模块导入时创建一个全局实例，或在需要时用函数创建（见[在项目里组织配置](#在项目里组织配置)）。
:::

## 环境变量名怎么对应字段

默认规则很简单：**字段名就是变量名，大小写不敏感**。`database_url` 可以被 `DATABASE_URL`、`database_url` 覆盖。

### 统一前缀

多人共用一份 `.env` 或同一台机器跑多个服务时，用 `env_prefix` 给所有变量加前缀：

```python
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="app_")

    name: str = "demo"      # 读取 APP_NAME
    debug: bool = False     # 读取 APP_DEBUG
```

### 单个字段换名字

前缀解决不了的情况用别名。`validation_alias` **只影响读取**，模型里的字段名保持不变：

```python
from pydantic import AliasChoices, Field

class Settings(BaseSettings):
    # 环境变量叫 MY_AUTH_KEY，代码里仍然用 auth_key
    auth_key: str = Field(validation_alias="MY_AUTH_KEY")

    # 兼容新旧两种写法，按顺序取第一个存在的
    db_url: str = Field(validation_alias=AliasChoices("DATABASE_URL", "DB_URL"))
```

`alias` 与 `validation_alias` 的区别：`alias` 还会影响序列化（`model_dump(by_alias=True)`），只关心读环境变量时用 `validation_alias` 就够了。

::: tip
字段一旦设置了别名，默认的 `env_prefix` **不会**再套到别名上。需要加前缀时设置 `env_prefix_target="all"`。
:::

### 完整对照

| 配置 | 读取的环境变量 |
|------|----------------|
| `port: int` | `PORT` / `port` |
| `env_prefix="app_"` + `port` | `APP_PORT` |
| `Field(validation_alias="HTTP_PORT")` | `HTTP_PORT` |
| `AliasChoices("HTTP_PORT", "PORT")` | 先找 `HTTP_PORT`，没有再用 `PORT` |
| `case_sensitive=True` + `redis_host` | 只能匹配 `redis_host` |

## 类型转换

常见类型直接写注解即可，pydantic 负责从字符串转换和校验：

```python
from enum import StrEnum
from pathlib import Path

class Env(StrEnum):
    DEV = "dev"
    PROD = "prod"

class Settings(BaseSettings):
    debug: bool = False             # true / 1 / yes / on → True
    port: int = 8000                # "8000" → 8000
    timeout: float = 3.5            # "3.5" → 3.5
    log_path: Path = Path("logs")   # 字符串 → Path
    env: Env = Env.DEV              # "prod" → Env.PROD，非法值报错
```

布尔值的合法写法是 `true/false`、`1/0`、`yes/no`、`on/off`（大小写不敏感），写别的会校验失败，而不是像 `bool("false")` 那样悄悄得到 `True`。

### 列表、字典要写成 JSON

复杂类型会把环境变量的值当作 **JSON** 解析：

```bash
ALLOWED_HOSTS=["a.com", "b.com"]
FEATURE_FLAGS={"new_ui": true, "beta": false}
```

```python
class Settings(BaseSettings):
    allowed_hosts: list[str] = []
    feature_flags: dict[str, bool] = {}
```

写成逗号分隔的 `ALLOWED_HOSTS=a.com,b.com` 会直接抛 `SettingsError`（`1,2,3` 不是合法 JSON）。确实想支持逗号分隔时，用 `NoDecode` 关掉 JSON 解析，自己转：

```python
from typing import Annotated

from pydantic import BeforeValidator
from pydantic_settings import NoDecode, BaseSettings

def split_comma(value: object) -> object:
    if isinstance(value, str):
        return [item.strip() for item in value.split(",") if item.strip()]
    return value

CommaSeparated = Annotated[list[str], NoDecode, BeforeValidator(split_comma)]

class Settings(BaseSettings):
    cors_origins: CommaSeparated = []
```

这样 `CORS_ORIGINS=https://a.com, https://b.com` 就能正常解析。

### 敏感字段用 SecretStr

`SecretStr` 会隐藏 `repr()` 和日志里的真实值，避免密钥被顺手打印出来：

```python
from pydantic import SecretStr

class Settings(BaseSettings):
    api_key: SecretStr

settings = Settings()
print(settings.api_key)                    # **********
print(settings.api_key.get_secret_value()) # 真正的值，需要时显式取出
```

## 嵌套配置

配置项多了以后，按模块分组比一长串平铺字段清晰得多。让子模型继承 `BaseModel`，再用 `env_nested_delimiter` 指定分隔符：

```python
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict

class Database(BaseModel):
    host: str = "localhost"
    port: int = 5432
    user: str = "postgres"

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_nested_delimiter="__")

    database: Database = Database()
    debug: bool = False
```

```bash
DATABASE__HOST=db.internal
DATABASE__PORT=6543
```

对应 `settings.database.host == "db.internal"`、`settings.database.port == 6543`。

也可以整体传 JSON，两种方式可以混用，**嵌套变量优先级更高**：

```bash
DATABASE={"host": "db.internal", "port": 5432}
DATABASE__PORT=6543
```

::: warning
子模型必须继承 `pydantic.BaseModel`，否则 pydantic-settings 会把它当成普通字段单独收集，结果不符合预期。
:::

如果分隔符用单下划线 `_`，而字段名本身带下划线（如 `api_key`），`APP_LLM_API_KEY` 可能被拆成 `llm.api.key`。这时用 `env_nested_max_split=1` 限制只拆一层：

```python
class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="app_",
        env_nested_delimiter="_",
        env_nested_max_split=1,
    )
    llm: LLMConfig
```

## .env 文件

`env_file` 指定文件路径，`env_file_encoding` 指定编码（Windows 上中文注释多时建议显式写 `utf-8`）：

```python
class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local"),  # 后面的文件覆盖前面的
        env_file_encoding="utf-8",
        extra="ignore",
    )
```

几个容易踩的点：

### 路径相对当前工作目录

`env_file` 的相对路径是相对**进程的当前工作目录**，不是相对这个 `.py` 文件。从别的目录启动脚本时就会找不到文件（而且默认不报错），用绝对路径最稳：

```python
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
```

### .env 里多出来的键会报错

`BaseSettings` 默认 `extra="forbid"`，`.env` 中出现了模型里没定义的变量会抛 `ValidationError`。常见处理：

```python
model_config = SettingsConfigDict(
    env_file=".env",
    extra="ignore",                      # 直接忽略未定义的键
    # dotenv_filtering="only_existing",  # 或者只保留能对应到字段的键
    # dotenv_filtering="match_prefix",   # 或者只保留符合 env_prefix 的键
)
```

而**真实环境变量**中不匹配任何字段的变量本来就会被静默忽略，`extra='forbid'` 也管不到 `os.environ`。所以变量名拼错时往往不报错，只是默默用了默认值。

### 环境变量永远优先于 .env

同一项在两处都有值时，**环境变量赢**。这正是「本地 `.env` + 生产环境注入变量」能共存的原因。

### 实例化时覆盖文件

```python
Settings(_env_file=".env.prod")   # 临时指定另一个文件，忽略 model_config 里的
Settings(_env_file=None)          # 完全不加载 .env，测试里很好用
```

### 空值

环境变量存在但值为空字符串时，默认会原样参与解析（`int` 字段会报错）。想让空值走默认值：

```python
SettingsConfigDict(env_ignore_empty=True)
```

## 优先级

多个来源同时存在时，按下面的顺序取，**越靠前优先级越高**：

| 顺序 | 来源 | 典型用途 |
|------|------|----------|
| 1 | 命令行参数 | 启用 `cli_parse_args` 时，默认排在最前 |
| 2 | 初始化参数 `Settings(...)` | 测试、临时覆盖 |
| 3 | 环境变量 | 生产环境、Docker、CI |
| 4 | `.env` 文件 | 本地开发 |
| 5 | secrets 目录 | 挂载的密钥文件 |
| 6 | 字段默认值 | 兜底 |

记住两条就够用：**显式传入 > 环境变量 > `.env` > 默认值**。

## secrets 目录

Docker、Kubernetes 通常把密钥以**文件**形式挂载进来，`secrets_dir` 就是为这种场景准备的：目录里的**文件名即变量名，文件内容即值**。

```python
class Settings(BaseSettings):
    model_config = SettingsConfigDict(secrets_dir="/run/secrets")
    db_password: str
```

```text
/run/secrets/db_password   # 文件内容就是密码
```

同样可以在实例化时覆盖：`Settings(_secrets_dir="/run/secrets")`。

## 在项目里组织配置

推荐把配置收在一个 `config.py` 里，用 `lru_cache` 保证全局只有一份实例，同时方便测试时清缓存：

```python
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="app_",
        extra="ignore",
    )

    name: str = "demo"
    debug: bool = False
    database_url: str


@lru_cache
def get_settings() -> Settings:
    return Settings()
```

FastAPI 里直接当依赖注入：

```python
from fastapi import Depends, FastAPI

from demo.config import Settings, get_settings

app = FastAPI()


@app.get("/info")
def info(settings: Settings = Depends(get_settings)):
    return {"name": settings.name, "debug": settings.debug}
```

### 测试里怎么用

```python
def test_settings(monkeypatch):
    monkeypatch.setenv("APP_DATABASE_URL", "sqlite:///test.db")

    settings = Settings(_env_file=None)  # 不读本地 .env，避免互相干扰
    assert settings.database_url == "sqlite:///test.db"
```

如果被测代码用的是 `get_settings()`，记得在测试前后调用 `get_settings.cache_clear()`，否则第一次拿到的旧实例会一直生效。

## 自定义来源（进阶）

所有来源由 `settings_customise_sources` 组装，**返回顺序就是优先级顺序**。默认实现大致等价于：

```python
class Settings(BaseSettings):
    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls,
        init_settings,
        env_settings,
        dotenv_settings,
        file_secret_settings,
    ):
        return init_settings, env_settings, dotenv_settings, file_secret_settings
```

需要接入配置中心、Vault、YAML 时，写一个 `PydanticBaseSettingsSource` 子类加进这个元组即可，例如把自定义源插到环境变量之前：

```python
return init_settings, MySource(settings_cls), env_settings, dotenv_settings, file_secret_settings
```

同一套模型也能直接驱动命令行（可选）：

```python
class Settings(BaseSettings):
    model_config = SettingsConfigDict(cli_parse_args=True)
    port: int = 8000
```

```bash
uv run python app.py --port 9000
```

## 常见坑

| 现象 | 原因 | 处理 |
|------|------|------|
| `SettingsError: error parsing value for field ...` | `list` / `dict` 字段的值不是合法 JSON | 写成 `["a", "b"]`，或用 `NoDecode` 自定义解析 |
| `.env` 里多写一个变量就报 `extra_forbidden` | `BaseSettings` 默认 `extra='forbid'` | 设 `extra="ignore"` 或 `dotenv_filtering="only_existing"` |
| 改了 `.env` 不生效 | 实例在导入时就创建好了 | 重启进程；或改用 `get_settings()` + `cache_clear()` |
| 找不到 `.env` 但也不报错 | 路径相对当前工作目录，文件缺失被静默跳过 | 用 `Path(__file__)` 拼绝对路径 |
| 嵌套字段读不到 | 子模型没继承 `BaseModel`，或分隔符写错 | 继承 `BaseModel`，检查 `env_nested_delimiter` |
| 变量名拼错却不报错 | 未匹配的环境变量会被静默忽略 | 关键配置设成必填，缺失时让启动直接失败 |
| `case_sensitive=True` 在 Windows 无效 | `os.environ` 会把变量名统一大写 | 用 `validation_alias` 指定变量名 |
| 默认值写错类型，启动就报错 | `BaseSettings` 默认**会**校验默认值（`BaseModel` 不会） | 修正默认值；要关闭校验设 `validate_default=False` |
