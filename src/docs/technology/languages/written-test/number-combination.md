# 数字组合

## 题目描述

多多君最近在研究某种数字组合，定义为：**每个数字的十进制表示中（0~9），每个数位各不相同，且各个数位之和等于 N**。

满足条件的数字可能很多，找到其中的**最小值**即可。

多多君还有很多研究课题，于是多多君找到了你——未来的计算机科学家寻求帮助。

## 数据范围

- 1 - 1000
- 进阶：空间复杂度 O(1)，时间复杂度 O(n)

## 输入描述

共一行，一个正整数 N，如题意所示，表示组合中数字不同数位之和。
（1 <= N <= 1,000）

## 输出描述

共一行，一个整数，表示该组合中的最小值。

如果组合中没有任何符合条件的数字，那么输出 `-1` 即可。

## 示例

### 示例 1

- 输入：`5`
- 输出：`5`
- 说明：符合条件的数字有 `5, 14, 23, 32, 41`，其中最小值为 `5`

### 示例 2

- 输入：`12`
- 输出：`39`

### 示例 3

- 输入：`50`
- 输出：`-1`
- 说明：没有符合条件的数字


::: details 答案

``` ts
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const rl = createInterface({ input: stdin, output: stdout });

const n = Number(await rl.question("请输入正整数："));

function theSmallestNum(num:number): number {
    //位数
    const weishu = Math.trunc(num / 9) + 1;
    let result: number = 0;
    let n: number = -1;
    for (let i = 1; i <= weishu; i++) {
        if (num - 9 > 0) {
            num -= 9;
            result += 9 * (10 ** (i - 1))
        } else {
            result += num * (10 ** (i - 1))
        }
    }
    return result <= 1000 ? result : -1;
}

console.log(theSmallestNum(n));

rl.close();

```

:::

## 附录

### 1. 取整

`Math.trunc(num: number) => number`

`Math.trunc` 会直接去掉小数部分，向零取整，返回整数部分。

```ts
Math.trunc(5.9); // 5
Math.trunc(14 / 9); // 1
```

### 2. 幂运算

`10 ** n => number`

`**` 是幂运算符，等价于 `Math.pow(10, n)`。这里用 `10 ** (i - 1)` 得到第 `i` 位（从个位开始）对应的权重。

```ts
10 ** 0; // 1
10 ** 2; // 100
```

### 3. 字符串转数字

`Number(value: string) => number`

将字符串转换为数字，常用于把 `readline` 读到的输入转为数值。

```ts
Number("12"); // 12
```

