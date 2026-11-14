# 用 uv 作为项目管理器

::: warning 先看这段声明

官方文档里 `uv init` 默认生成的是 `src/包名/` 的布局，**本文档不教那套「标准写法」**。

这里直接约定：包名固定叫 `app`，**就放在项目根目录下**（即 `app/`），
再用 `[tool.uv.build-backend]` 里的 `module-root = ""` 告诉 `uv_build` 不要去 `src/` 里找包。
后文所有示例都基于这个结构，请不要按官方默认布局来对照。

:::

## uv 是什么

`uv` 是一个 Python 包与项目管理器。

## 安装 uv

Windows（PowerShell）：

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

macOS / Linux：

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

也可以用包管理器（`winget install --id=astral-sh.uv`、`brew install uv`、`pipx install uv`）。

装完之后验证：

```bash
uv --version
# uv 0.13.8
```

## 创建项目

```bash
uv init my-project
cd my-project
```

::: tip 也可以这样创建

上述方法会创建一个文件夹叫 `my-project`。

也可以先手动创建一个文件夹，进入文件夹后执行 `uv init`（目录名会成为项目名）。

:::

`uv init` 默认生成的目录是这样的：

```text
my-project/
├── .gitignore
├── .python-version        # 项目使用的 Python 版本
├── README.md
├── pyproject.toml         # 项目元信息 + 依赖清单
└── src/
    └── my_project/        # 包名用下划线
        └── __init__.py    # 模板自带一个 main()
```

**但本文档不要这个布局。**我们要把包挪到根目录、改名叫 `app`，最终结构是：

```text
my-project/
├── .gitignore
├── .python-version
├── README.md
├── pyproject.toml
├── uv.lock                # 第一次 uv sync 后生成
├── app/                   # 我们的包，直接在根目录
│   ├── __init__.py
│   └── main.py
└── tests/                 # 测试也放根目录
    └── test_main.py
```

操作上就是两件事：

1. 删掉 `src/`，在根目录新建 `app/`（把 `__init__.py` 挪进去）；
2. 在 `pyproject.toml` 里补一段 `[tool.uv.build-backend]`，把模块根目录指到项目根。

::: tip 更省事的起点 --bare

`uv init --bare` 只生成一个 `pyproject.toml`，不建 `src/`、不建 `main.py`，正好省掉第一步的删除工作，然后自己建 `app/` 即可。

:::

## pyproject.toml 的关键配置

完整的 `pyproject.toml` 大致长这样：

```toml
[project]
name = "my-project"
version = "0.1.0"
description = "Add your description here"
readme = "README.md"
requires-python = ">=3.12"
dependencies = []

[build-system]
requires = ["uv_build>=0.13.8,<0.14.0"]
build-backend = "uv_build"

[tool.uv.build-backend]
module-root = ""      # 模块根目录 = 项目根目录（默认是 "src"）
module-name = "app"   # 包名就叫 app，对应根目录下的 app/

[project.scripts]
hello = "app.main:main"
```

- `dependencies = []`：初始项目不带任何依赖，需要什么再 `uv add` 加
- `build-backend = "uv_build"`：项目仍然是个「可安装的包」，所以 `uv sync` 会以可编辑模式把自己装进 `.venv`，`import app` 能直接生效
- `module-root = ""`：默认值其实是 `"src"`，也就是去 `src/` 下找包。改成空字符串后，`uv_build` 认为模块根目录就是项目根目录，于是 `app/` 直接被识别
- `module-name = "app"`：显式指定包名。否则 `uv_build` 会按 `project.name` 推成 `my_project`，找不到那个模块就报错
- `[project.scripts]` 注册命令行入口，`hello` 指向 `app/main.py` 的 `main()`
- `.python-version` 告诉 uv 用哪个 Python 版本，本机没有时 uv 会自动下载

::: tip 为什么非要这么折腾

`module-root = ""` 之后，可编辑安装会把**项目根目录**加进 `sys.path`，所以 `app/`、`tests/` 这类根目录下的顶层目录全都能直接 `import`，不用写成 `from src.app import xxx`。

:::

## 打印 Hello World

新建 `app/main.py`：

```python
def main() -> None:
    print("Hello, World!")


if __name__ == "__main__":
    main()
```

上面 `pyproject.toml` 里的 `[project.scripts]` 已经把 `hello` 指向 `app.main:main`，所以直接：

```bash
uv run hello
# Hello, World!
```

也可以按文件运行：

```bash
uv run app/main.py
```

模板里 `app/__init__.py` 的那段 `main()` 可以一并删掉，让它只做包标记。

::: tip 换成 FastAPI 也是如此

先把依赖装上：

```bash
uv add fastapi "uvicorn[standard]"
```

`app/main.py` 里写 `app = FastAPI()`，启动命令就是：

```bash
uv run uvicorn app.main:app --reload
```

路径 `app.main:app` 里的 `app` 就是根目录下的这个包，不需要加任何前缀。

:::

::: tip 第一次运行的产物

第一次执行 `uv run` 或 `uv sync` 时，uv 才会创建 `.venv/` 和锁文件 `uv.lock`。

不建项目也能跑一段代码：`uv run python -c "print('Hello, World!')"`。

:::

## 代码放哪儿

- `app/`：业务代码。子模块直接按包内相对结构放，例如 `app/db.py`、`app/models.py`，导入写 `from app.db import xxx`
- `tests/`：测试代码，与 `app/` 平级
- 根目录只留配置文件（`pyproject.toml`、`.python-version`、`README.md`），不散放 `.py` 源文件

## 常用命令

| 命令 | 作用 |
|------|------|
| `uv init 项目名` | 创建项目（默认 `src/` 布局，本文档要再改成根目录 `app/`） |
| `uv add requests` | 添加依赖，同步更新 `pyproject.toml` 和 `uv.lock` |
| `uv add --dev pytest` | 添加仅开发用的依赖 |
| `uv remove requests` | 移除依赖 |
| `uv sync` | 按锁文件把环境同步到位（同时可编辑安装本项目的 `app` 包） |
| `uv run 命令` | 在项目环境里执行命令 |
| `uv lock` | 重新解析并更新 `uv.lock` |
| `uv tree` | 查看依赖树 |
| `uv python install 3.12` | 安装指定版本的 Python |
| `uv venv` | 只创建虚拟环境，不建项目 |
| `uv pip install requests` | pip 兼容模式，适合临时试用或迁移旧项目 |

