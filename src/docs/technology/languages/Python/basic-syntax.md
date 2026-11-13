# 基础语法

## 缩进与代码块

Python 靠缩进划分代码块，同一层级的语句必须缩进相同。约定使用 **4 个空格**，不要混用 Tab：

```python
if True:
    print("缩进 4 个空格")
    if True:
        print("再进一层")
```

## 注释

```python
# 单行注释

"""
三个引号的是多行字符串，放在函数/类开头时作为文档字符串（docstring）
"""
```

## 变量与赋值

Python 的变量不需要声明类型，直接赋值即可：

```python
name = "chuanliu"
age = 18
height, weight = 1.75, 65   # 解包赋值
a = b = 0                   # 链式赋值
```

命名约定用**小写 + 下划线**（snake_case）。Python 没有真正的常量，约定全大写表示「不应该被修改」：

```python
MAX_RETRY = 3
```

## 运算符

| 运算符 | 说明 | 示例 |
|--------|------|------|
| `+` `-` `*` `/` | 加减乘除 | `7 / 2` → `3.5` |
| `//` | 整除，向下取整 | `7 // 2` → `3` |
| `%` | 取余 | `7 % 2` → `1` |
| `**` | 幂 | `2 ** 10` → `1024` |

注意 `/` 的结果**永远是浮点数**。

## 条件判断

```python
score = 75

if score >= 90:
    print("优秀")
elif score >= 60:
    print("及格")
else:
    print("不及格")
```

Python 没有 `switch`（3.10 起新增了 `match`），但支持**链式比较**：

```python
if 60 <= score < 90:
    print("及格")
```

## 循环

```python
# for：遍历可迭代对象
for i in range(3):
    print(i)

# while：条件循环
count = 0
while count < 3:
    count += 1
```

`range(start, stop, step)` 生成整数序列，**包含 start、不包含 stop**。

循环中用 `break` 跳出、`continue` 跳过本次：

```python
for i in range(10):
    if i == 5:
        break
```

`for ... else` 是一个不太常见的写法：循环**正常结束**（没有被 `break` 打断）时执行 `else`：

```python
for i in range(3):
    if i == 10:
        break
else:
    print("循环正常结束")
```

## 函数

用 `def` 定义，默认参数写在后面：

```python
def greet(name, greeting="你好"):
    return f"{greeting}，{name}"

greet("chuanliu")            # 你好，chuanliu
greet("chuanliu", "hello")   # hello，chuanliu
greet(greeting="hi", name="chuanliu")   # 关键字参数，顺序随意
```

`*` 之后的参数只能用关键字传入：

```python
def create_user(name, age, *, city="杭州"):
    ...

create_user("chuanliu", 18, city="上海")
```

可变参数用 `*args`（元组）和 `**kwargs`（字典）接收：

```python
def log(*args, **kwargs):
    print(args, kwargs)

log(1, 2, level="info")   # (1, 2) {'level': 'info'}
```

函数体只有一行时可以用 `lambda` 定义匿名函数，常配合排序、过滤使用：

```python
users = [{"name": "b"}, {"name": "a"}]
users.sort(key=lambda u: u["name"])
```

## 异常处理

```python
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"出错了：{e}")
except (TypeError, ValueError):
    print("捕获多种异常")
else:
    print("没有异常时执行")
finally:
    print("无论如何都会执行")
```

Python 的关键字是 `except`，没有 `try / catch`。捕获时尽量指定**具体异常类型**，裸写 `except:` 会把键盘中断之类的信号也吞掉。

## 导入模块

```python
import os
import json as js
from pathlib import Path
from typing import Optional
```

导入时 Python 会执行模块顶层代码，因此正式代码应把可执行逻辑放进 `if __name__ == "__main__":` 里：

```python
def main():
    print("只在直接运行时执行")

if __name__ == "__main__":
    main()
```

## 常用内置函数

| 函数 | 说明 |
|------|------|
| `len(x)` | 长度 |
| `type(x)` | 查看类型 |
| `isinstance(x, T)` | 判断是否为某类型 |
| `print(x)` | 输出 |
| `input(prompt)` | 读取用户输入，**返回字符串** |
| `enumerate(x)` | 同时拿到下标和值 |
| `zip(a, b)` | 并行遍历多个序列 |
| `sum` / `max` / `min` | 求和、最大、最小 |

## 下划线命名的约定

| 写法 | 含义 |
|------|------|
| `_name` | 内部使用，不建议外部引用 |
| `__name` | 名称改写（name mangling），用于类的私有属性 |
| `__name__` | 双下划线包围的是魔法属性/方法，如 `__init__`、`__str__` |
