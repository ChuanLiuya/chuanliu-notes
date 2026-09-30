# 数据类型

Python 的数据类型先按**可变 / 不可变**分两类，这个区别直接影响赋值、传参和字典的键。

| 类型 | 可变性 | 说明 |
|------|--------|------|
| `int` | 不可变 | 整数，长度不限 |
| `float` | 不可变 | 浮点数 |
| `bool` | 不可变 | `True` / `False` |
| `str` | 不可变 | 字符串 |
| `tuple` | 不可变 | 元组 |
| `frozenset` | 不可变 | 不可变集合 |
| `list` | 可变 | 列表 |
| `dict` | 可变 | 字典 |
| `set` | 可变 | 集合 |

## 数字

```python
a = 10          # int
b = 3.14        # float
c = 1_000_000   # 下划线分隔，方便阅读
d = 0x1f        # 十六进制
e = 1e-3        # 科学计数法 → 0.001
```

Python 的 `int` **没有长度上限**，不会溢出。除法和整除的区别见[基础语法](/technology/languages/Python/basic-syntax#运算符)。

浮点数存在精度问题，`0.1 + 0.2` 结果并不是 `0.3`，涉及金额等场景应改用 `decimal.Decimal`。

## 字符串 str

```python
s = "hello"
s = 'hello'          # 单双引号等价
s = """多行
字符串"""
```

常用操作：

```python
s = "  Hello, Python  "
s.strip()                 # 'Hello, Python'，去掉首尾空白
s.lower()                 # '  hello, python  '
s.replace("Hello", "Hi")
s.split(",")              # ['  Hello', ' Python  ']
",".join(["a", "b"])      # 'a,b'
s.startswith("  H")
len(s)
```

**f-string** 是最常用的格式化方式（Python 3.6+）：

```python
name, age = "chuanliu", 18
print(f"{name} 今年 {age} 岁")
print(f"{3.14159:.2f}")   # 保留两位小数 → 3.14
```

字符串**不可变**，所有「修改」方法都返回新字符串：

```python
s = "abc"
s.upper()      # 返回 'ABC'，但 s 本身还是 'abc'
s = s.upper()  # 想生效必须重新赋值
```

## 列表 list

有序、可变，用 `[]` 定义：

```python
nums = [3, 1, 2]

nums.append(4)          # 末尾追加
nums.insert(0, 0)       # 指定位置插入
nums.remove(1)          # 按值删除
nums.pop()              # 弹出末尾元素
nums.sort()             # 原地排序
sorted(nums)            # 返回新列表，不改原列表
nums[::-1]              # 反转
nums[1:3]               # 切片，含头不含尾
```

## 元组 tuple

有序、**不可变**，用 `()` 定义：

```python
point = (3, 4)
x, y = point            # 解包
single = (1,)           # 单元素元组必须带逗号
```

因为不可变，元组可以作为字典的键、放进集合。

## 字典 dict

键值对，用 `{}` 定义。Python 3.7+ 保证**插入顺序**：

```python
user = {"name": "chuanliu", "age": 18}

user["name"]                 # 访问，键不存在会抛 KeyError
user.get("city")             # 键不存在返回 None
user.get("city", "杭州")      # 指定默认值
user["city"] = "杭州"         # 新增 / 修改
del user["age"]
"name" in user               # 判断键是否存在

for key, value in user.items():
    print(key, value)
```

键必须是**不可变**类型（`int`、`str`、`tuple` 等），列表不能作为键。

## 集合 set

**无序、元素唯一**，用 `{}` 或 `set()` 定义，常用于去重和集合运算：

```python
a = {1, 2, 3}
b = set([2, 3, 4])

a | b    # 并集 {1, 2, 3, 4}
a & b    # 交集 {2, 3}
a - b    # 差集 {1}
a ^ b    # 对称差集 {1, 4}

list(set([1, 1, 2, 3]))   # 去重 → [1, 2, 3]
```

创建**空集合只能用 `set()`**，`{}` 得到的是空字典。

## None 与布尔值

`None` 表示「没有值」，判断时用 `is` 而不是 `==`：

```python
result = None
if result is None:
    ...
```

以下值在布尔判断中为 falsy（等同于 False）：

```python
False, None, 0, 0.0, "", [], {}, set()
```

## 类型判断与转换

```python
type(1)                # <class 'int'>
isinstance(1, int)     # True，判断类型推荐用这个

int("18")      # 18
float("3.14")  # 3.14
str(18)        # '18'
list("abc")    # ['a', 'b', 'c']
tuple([1, 2])  # (1, 2)
set([1, 1])    # {1}
```

## 可变类型的坑

两个变量指向同一个可变对象时，改一个会影响另一个：

```python
a = [1, 2]
b = a
b.append(3)
print(a)      # [1, 2, 3]，a 也跟着变了

c = a.copy()  # 浅拷贝，改 c 不再影响 a
```

作为函数参数传入时同理，函数内部修改列表会反映到外部：

```python
def add_item(items):
    items.append(1)

nums = []
add_item(nums)
print(nums)   # [1]
```

想避免这种情况，传入副本即可：`add_item(nums.copy())`。

## 推导式

用一行生成列表、字典或集合：

```python
[x * 2 for x in range(3)]              # [0, 2, 4]
[x for x in range(10) if x % 2 == 0]   # [0, 2, 4, 6, 8]
{x: x ** 2 for x in range(3)}          # {0: 0, 1: 1, 2: 4}
{x for x in "hello"}                   # {'h', 'e', 'l', 'o'}
```

完整结构是 `[表达式 for 变量 in 可迭代对象 if 条件]`。
