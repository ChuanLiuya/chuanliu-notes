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
    debug: bool = False

settings = Settings()

```

**`BaseSettings`** 是 `pydantic_settings` 提供的配置基类，提供了读取配置，匹配字段和校验类型的功能。
- `env_file` 是env文件的位置，基于项目更目录的。
- `env_file_encoding` 是编码。

配置好了之后，`settings = Settings()`这一句做个实例化，方便外部导入。

在类内部，变量名习惯上用小写。

字段后面直接赋值就是**默认值**，比如上面 `Settings` 里的 `debug`：

```python
debug: bool = False
```

`.env` 里有 `DEBUG=true` 就优先用文件里的值，没有才用默认值 `False`。类型注解会自动做转换：`.env` 里写的都是字符串 `"true"`，读出来是布尔值 `True`；写成 `int`、`float`、`list` 等类型也一样，会按注解自动解析。

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

### 2. 默认值会掩盖配置错误

字段一旦写了默认值，`.env` 里缺这个变量时 `Settings()` 也**不会报错**，而是悄悄用默认值：

```python
test_var: str = "nihaoya"
```

这时 `.env` 里忘了写，或者变量名拼错（写成 `TEST_VAR2`），程序照样能启动，但读到的只是默认值，很难第一时间发现问题。

读取的优先级是：`Settings(...)` 传入的参数 > 系统环境变量 > `.env` 文件 > 字段默认值。默认值只在前面都没有的时候才生效。

::: warning
`.env` 里写成 `TEST_VAR=`（等号后为空）时，读到的是**空字符串**，并不会回退到默认值。
:::
