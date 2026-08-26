# 字符串变换的最小代价

## 题目描述

给定两个**长度相同**的字符串 X 和 Y（仅包含小写字母）。你可以进行以下两种操作：

- **交换**相邻字符，代价为 `0`
- **修改**某个字符为另一个字符，代价为两个字符 ASCII 码差值的绝对值

求将 X 和 Y 变换成**相同字符串**所需的最小总代价。

## 数据范围

- 1 ≤ N ≤ 2,000（N 为字符串长度）

## 输入描述

共三行：

- 第一行：一个整数 N，表示字符串长度
- 第二行：字符串 X
- 第三行：字符串 Y

（字符串中仅包含小写字母）

## 输出描述

共一行，一个整数，表示将 X 和 Y 变换成一样的字符串需要的最小的总代价。

## 示例

**示例 1**

- 输入：
  ```
  4
  abca
  abcd
  ```
- 输出：`3`
- 说明：其中一种代价最小的变换方案：都修改为 `abcd`，将第一个字符串 X 最后一个字符 `a` 修改为 `d`，代价为 `|a - d| = 3`

**示例 2**

- 输入：
  ```
  4
  baaa
  aabb
  ```
- 输出：`1`
- 说明：先将第一个字符串通过交换相邻字符：`baaa -> abaa -> aaba`，代价为 0。然后将第二个字符串最后一个字符 `b` 修改为 `a`：`|b - a| = 1`。两字符都修改为 `aaba`，最小总代价为 1

**示例 3**

- 输入：
  ```
  3
  abc
  xyz
  ```
- 输出：`69`

## 答案

::: details 答案

```ts
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";

const rl = createInterface({ input: stdin, output: stdout });

const n = await rl.question("请输入长度：");
const str1 = await rl.question("请输入第一个字符串：");
const str2 = await rl.question("请输入第二个字符串：");

function mySolu(n: string, str1: string, str2: string) {
  let result: number = 0;
  for (let i = 0; i < Number(n); i++) {
    result += str1.charCodeAt(i) - str2.charCodeAt(i);
  }
  return result > 0 ? result : -result;
}

console.log(mySolu(n, str1, str2));

rl.close();
```

:::

## 附录

### 1. 获取字符的 ASCII 码

`str.charCodeAt(index: number) => number`

返回字符串中指定位置字符的 Unicode（ASCII）码，这里用于计算两个字符的差值。

```ts
"abca".charCodeAt(3); // 97，即字符 'a' 的 ASCII 码
"abcd".charCodeAt(3); // 100，即字符 'd' 的 ASCII 码
```

### 2. 取绝对值

`Math.abs(num: number) => number`

返回一个数的绝对值。题目要求代价非负，所以需要对差值取绝对值。

```ts
Math.abs(-3); // 3
Math.abs(3); // 3
```

### 3. 字符串转数字

`Number(value: string) => number`

将字符串转换为数字，常用于把 `readline` 读到的输入转为数值。

```ts
Number("4"); // 4
```
