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
├── .python-version        # 项目使用的 Python 版本
├── README.md
├── pyproject.toml         # 项目元信息 + 依赖清单
└── src/
    └── hello_uv/
        └── __init__.py
```

- `pyproject.toml` 依赖、脚本入口、构建后端都写在这里
- `.python-version` 告诉 uv 用哪个 Python 版本，本机没有时 uv 会自动下载


## 打印 Hello World

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

- 第一次执行 `uv run` 或 `uv sync` 时，uv 才会创建 `.venv/` 和锁文件 `uv.lock`


也可以按文件运行，或者不建项目直接跑一段代码：

```bash
uv run src/hello_uv/main.py
uv run python -c "print('Hello, World!')"
```

模板里 `__init__.py` 的那段 `main()` 可以一并删掉，让它只做包标记。

## 常用命令

| 命令 | 作用 |
|------|------|
| `uv init 项目名` | 创建项目 |
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

