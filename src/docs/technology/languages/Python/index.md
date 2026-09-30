# Python

## Python 是什么？

**Python** 是一种**解释型**、**动态类型**的通用编程语言，由 Guido van Rossum 于 1991 年发布。它的设计哲学强调代码的**可读性**，官方那句 "Simple is better than complex" 基本概括了它的风格。

与 C、Java 这类需要先编译成机器码的语言不同，Python 代码交给**解释器**逐行执行，写完直接运行、省去编译环节，代价是运行速度相对较慢。

## 核心特点

### 1. 用缩进划分代码块

Python 不用 `{}` 包裹代码块，而是用**缩进**（约定为 4 个空格）表示层级关系：

```python
if score >= 60:
    print("及格")
else:
    print("不及格")
```

缩进在 Python 里是**语法的一部分**，混用 Tab 和空格会直接抛 `IndentationError`。

### 2. 动态类型

变量不需要声明类型，类型在赋值时确定，并且可以随时改写：

```python
age = 18             # int
age = "十八"          # 同一个变量换成 str 也不会报错
```

类型也可以写在变量名上，但那只是**类型注解**，用于静态检查和编辑器提示，运行时不会强制约束：

```python
def add(a: int, b: int) -> int:
    return a + b
```

### 3. 一切皆对象

数字、字符串、函数、类本身都是对象，可以赋值给变量、作为参数传递、作为返回值。

### 4. 标准库 + 第三方生态

标准库自带 `os`、`json`、`re`、`datetime`、`pathlib` 等常用模块，开箱即用；第三方包通过 `pip` 一条命令安装，覆盖各个领域。

## 常见应用领域

| 领域 | 常用库 / 框架 |
|------|---------------|
| 数据分析 | numpy、pandas |
| 机器学习 / 深度学习 | scikit-learn、PyTorch |
| Web 后端 | Django、Flask、FastAPI |
| 爬虫 | requests、Scrapy |
| 自动化脚本 | 标准库 + pyautogui、Selenium |

## 版本说明

Python 2 已于 2020 年停止维护，新项目统一使用 **Python 3**。Python 3 每年 10 月发布一个小版本（3.12、3.13 …），通常只保留最近几个版本的支持。

## 相关文档

- [快速上手](/technology/languages/Python/quick-start)
- [基础语法](/technology/languages/Python/basic-syntax)
- [数据类型](/technology/languages/Python/data-types)
- [虚拟环境与包管理](/technology/languages/Python/venv-pip)
