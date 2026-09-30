# 快速上手

## 安装 Python

到 [python.org](https://www.python.org/downloads/) 下载对应系统的安装包，或者用系统自带的包管理器安装。

Windows 上用官方安装包时，记得勾选 **Add Python to PATH**，否则命令行里找不到 `python` 命令。

安装完成后验证版本：

```bash
python --version
# Python 3.13.0
```

macOS / Linux 上系统自带的可能是 Python 2，需要用 `python3`：

```bash
python3 --version
```

## 交互式解释器（REPL）

命令行里直接输入 `python`（或 `python3`）会进入交互模式，出现 `>>>` 提示符，可以逐行输入并立即看到结果：

```python
>>> 1 + 1
2
>>> name = "chuanliu"
>>> print(f"hello {name}")
hello chuanliu
```

退出方式：输入 `exit()`，或者 Windows 下按 `Ctrl + Z` 回车，macOS / Linux 下按 `Ctrl + D`。

REPL 适合试写零散代码、验证语法，正式代码还是写成文件。

## 第一个脚本

新建文件 `hello.py`：

```python
print("Hello, Python!")
```

在终端运行：

```bash
python hello.py
# Hello, Python!
```

Python 脚本以 `.py` 为扩展名，一个文件就是一个**模块**，既可以独立运行，也可以被其他文件 `import`。

## 常见运行方式

| 方式 | 命令 | 适用场景 |
|------|------|----------|
| 交互式 | `python` | 临时验证想法 |
| 运行脚本 | `python hello.py` | 日常开发 |
| 运行内置模块 | `python -m http.server` | 以模块形式启动标准库工具 |
| 安装第三方包 | `pip install requests` | 引入外部依赖 |

## 下一步

- 语言基础看[基础语法](/technology/languages/Python/basic-syntax)和[数据类型](/technology/languages/Python/data-types)
- 项目里怎么隔离依赖看[虚拟环境与包管理](/technology/languages/Python/venv-pip)
