# 用 uv 作为管理器

## uv 是什么

`uv` 是一个 Python 包与项目管理器。

## 安装 uv


装完之后验证：

```bash
uv --version
# uv 0.13.8
```

## 创建项目

`uv init` 有两种常用形态：**打包模式**（默认）和**扁平模式**（加 `--no-package`）。区别在于项目要不要按「一个可安装的 Python 包」来组织。

### 打包模式（默认）

适合**要发出去**的代码：库、SDK、命令行工具，或者以后会被别的项目 `import` 的模块。

```bash
uv init hello-uv
cd hello-uv
```

::: tip 也可以这样创建

上述方法会创建一个文件夹叫 `hello-uv` 

也可以先手动创建一个文件夹，进入文件夹后执行`uv init`

:::

生成的目录结构：

```text
hello-uv/
├── .gitignore
├── .python-version        # 项目使用的 Python 版本
├── README.md
├── pyproject.toml         # 项目元信息 + 依赖清单
└── src/
    └── hello_uv/          # 包名用下划线
        └── __init__.py    # 模板自带一个 main()
```

`pyproject.toml` 里会自动带上构建配置和脚本入口：

```toml
[project.scripts]
hello-uv = "hello_uv:main"

[build-system]
requires = ["uv_build>=0.13.8,<0.14.0"]
build-backend = "uv_build"
```

- `src/` 布局把源码和项目根目录隔开，避免 `import hello_uv` 时误读到根目录里的同名文件
- 有 `[build-system]`，这个项目才能被 `uv build` 打成 wheel / sdist，也才能被别的项目 `uv add`
- `[project.scripts]` 注册命令行入口，安装后可以直接执行 `hello-uv`
- `.python-version` 告诉 uv 用哪个 Python 版本，本机没有时 uv 会自动下载

### 扁平模式（--no-package）

适合**只给自己跑**的项目：后端服务、脚本、爬虫、内部工具。这类代码不需要发布，也不需要被别的项目当库引用。

```bash
uv init --no-package hello-flat
cd hello-flat
```

生成的目录结构：

```text
hello-flat/
├── .gitignore
├── .python-version
├── README.md
├── main.py                # 入口直接放在根目录
└── pyproject.toml
```

`pyproject.toml` 里没有 `[build-system]`，也没有 `[project.scripts]`：

```toml
[project]
name = "hello-flat"
version = "0.1.0"
description = "Add your description here"
readme = "README.md"
requires-python = ">=3.11"
dependencies = []
```

- 项目**不会被当成包安装**，`uv sync` 只负责按 `pyproject.toml` 建好环境
- 自己写的模块直接放在根目录，`from utils import xxx` 就能用，不用先「安装自己」
- 没有构建后端，不能 `uv build` 发布，也不能被别的项目依赖
- 运行入口就是文件：`uv run main.py`

### 两种方式怎么选

| | 默认（打包） | `--no-package`（扁平） |
| --- | --- | --- |
| 代码位置 | `src/包名/` | 项目根目录 |
| `[build-system]` | 有 | 无 |
| `uv build` 打包发布 | 可以 | 不可以 |
| 被其他项目依赖 | 可以 | 不可以 |
| 典型场景 | 库、CLI 工具、SDK、要发 PyPI | 自用后端、脚本、内部服务 |

判断标准就一条：**这份代码会不会被「安装」**。会，用默认的打包模式；不会，就加 `--no-package` 把结构拍平。

::: tip 还有更轻的 --bare

`uv init --bare` 只生成一个 `pyproject.toml`，不建 `src/`、不建 `main.py`，适合在已有目录里补一份依赖清单。

:::


## 打印 Hello World

### 打包模式

新建 `src/hello_uv/main.py`：

```python
def main() -> None:
    print("Hello, World!")


if __name__ == "__main__":
    main()
```

再把 `pyproject.toml` 里的脚本入口指向新文件：

```toml
[project.scripts]
hello-uv = "hello_uv.main:main"
```

运行

```bash
uv run hello-uv
# Hello, World!
```

也可以按文件运行：

```bash
uv run src/hello_uv/main.py
```

模板里 `__init__.py` 的那段 `main()` 可以一并删掉，让它只做包标记。

### 扁平模式

模板生成的 `main.py` 本来就是入口：

```python
def main():
    print("Hello from hello-flat!")


if __name__ == "__main__":
    main()
```

直接运行：

```bash
uv run main.py
# Hello from hello-flat!
```

- 第一次执行 `uv run` 或 `uv sync` 时，uv 才会创建 `.venv/` 和锁文件 `uv.lock`
- 两种模式都可以不建项目直接跑一段代码：`uv run python -c "print('Hello, World!')"`

## 常用命令

| 命令 | 作用 |
|------|------|
| `uv init 项目名` | 创建打包模式项目（可发布、可被依赖） |
| `uv init --no-package 项目名` | 创建扁平模式项目（自用应用 / 脚本） |
| `uv add requests` | 添加依赖，同步更新 `pyproject.toml` 和 `uv.lock` |
| `uv add --dev pytest` | 添加仅开发用的依赖 |
| `uv remove requests` | 移除依赖 |
| `uv sync` | 按锁文件把环境同步到位 |
| `uv run 命令` | 在项目环境里执行命令 |
| `uv lock` | 重新解析并更新 `uv.lock` |
| `uv tree` | 查看依赖树 |
| `uv python install 3.12` | 安装指定版本的 Python |
| `uv venv` | 只创建虚拟环境，不建项目 |
| `uv pip install requests` | pip 兼容模式，适合临时试用或迁移旧项目 |

