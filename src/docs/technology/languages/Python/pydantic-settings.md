# 管理环境变量

本文档将使用 `pydantic-settings` 来管理环境变量。

## 安装 `pydantic-settings` 包

```bash
uv add pydantic-settings
```

::: tip
`fastapi` 应该会自带这个包。
:::

## 使用环境变量


首先在根目录创建 `.env` 文件：

```bash
TEST_VAR=nihaoya
```

::: warning

别忘了把 `.env` 文件写入 `.gitignore` !

:::

然后创建 `config.py`

```python

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8"
    )

    test_var : str

settings = Settings()

```

**`BaseSettings`** 是 `pydantic_settings` 提供的配置基类，提供了读取配置，匹配字段和校验类型的功能。
`env_file` 是env文件的位置，基于项目更目录的。
`env_file_encoding` 是编码。

配置好了之后，`settings = Settings()`这一句做个实例化，方便外部导入。

在类内部，变量名习惯上用小写。

`main.py`：

```python

from config import settings


print(settings.test_var)
```
## 注意事项

### 1. 路径相对当前工作目录

`env_file` 的相对路径是相对**进程的当前工作目录**。
举个例子：你在vscode点击右上角的开始时，默认的开始找的目录是你vscode打开文件夹的根目录，而不是项目的根目录。
用绝对路径最稳。  
假如你的config.py在 

`根目录/app/config.py`

那么可以这样写：

```python

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file= BASE_DIR / ".env",
        env_file_encoding="utf-8"
    )

    test_var : str

settings = Settings()
```
