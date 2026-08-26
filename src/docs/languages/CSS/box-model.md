# 盒模型（Box Model）

## 什么是盒模型？

在 CSS 中，**每个元素都被看作一个矩形盒子**。盒模型描述了这个盒子的组成结构——从内到外依次是：

```
┌─────────────────────────────┐
│          margin             │  外边距（透明，不占背景）
│  ┌───────────────────────┐  │
│  │       border          │  │  边框
│  │  ┌─────────────────┐  │  │
│  │  │    padding      │  │  │  内边距（透明，但占背景）
│  │  │  ┌───────────┐  │  │  │
│  │  │  │  content  │  │  │  │  内容区
│  │  │  └───────────┘  │  │  │
│  │  └─────────────────┘  │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

## 两种盒模型

CSS 有两种盒模型，由 `box-sizing` 控制：

| 属性值 | 名称 | `width/height` 包含 | 实际占用宽度 |
|--------|------|---------------------|-------------|
| `content-box` | **标准盒模型**（默认） | 仅 content | `width + padding + border + margin` |
| `border-box` | **IE盒模型 / 替代盒模型** | content + padding + border | `width + margin` |

### 标准盒模型（content-box）

```css
.box {
  box-sizing: content-box; /* 默认值 */
  width: 200px;
  padding: 20px;
  border: 10px solid #333;
  margin: 30px;
}
```

实际占用宽度：`200 + 20×2 + 10×2 + 30×2 = 320px`

内容区域宽度：`200px`（等于 `width`）

### IE 盒模型（border-box）

```css
.box {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 10px solid #333;
  margin: 30px;
}
```

实际占用宽度：`200 + 30×2 = 260px`

内容区域宽度：`200 - 20×2 - 10×2 = 140px`（width 减去 padding 和 border）

::: tip 实际开发建议
在项目中使用 `border-box` 更直观——设多大就是多大，不用额外计算 padding 和 border。常用全局重置：

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```
:::

## 盒模型各层详解

| 层次 | 是否占背景 | 能否为负值 | 说明 |
|------|:--------:|:--------:|------|
| **content** | ✅ | — | 内容区，由 `width`/`height` 定义（取决于 box-sizing） |
| **padding** | ✅（显示背景色/图） | ❌ | 内边距，撑开盒子但不影响外边距折叠 |
| **border** | ✅（有自己的颜色） | ❌ | 边框，位于 padding 外侧 |
| **margin** | ❌（透明） | ✅ | 外边距，用于控制元素间距，可负值（拉近/重叠） |

## 行内元素与块级元素的盒模型差异

| 特性 | 块级元素（div/p/h1） | 行内元素（span/a） |
|------|---------------------|-------------------|
| `width`/`height` | ✅ 生效 | ❌ 无效（由内容撑开） |
| `margin-top/bottom` | ✅ 生效 | ❌ 无效 |
| `margin-left/right` | ✅ 生效 | ✅ 生效 |
| `padding-top/bottom` | ✅ 生效 | ✅ 生效但不占空间（视觉上会覆盖上下行） |
| `padding-left/right` | ✅ 生效 | ✅ 生效 |

注意：行内元素设为 `display: inline-block` 后，宽高和上下 margin 都会生效。

## margin 重叠（折叠）

**相邻的块级元素的上下 margin 会发生重叠**，取较大值而非相加。

```html
<div class="box1">上</div>
<div class="box2">下</div>
```

```css
.box1 { margin-bottom: 30px; }
.box2 { margin-top: 20px; }
/* 两个 div 之间间距是 30px，不是 50px */
```

**触发 margin 重叠的场景：**

| 场景 | 示例 |
|------|------|
| 相邻兄弟元素 | 上一个的 `margin-bottom` 和下一个的 `margin-top` |
| 父子元素 | 父元素没有 border/padding 隔开时，子元素的 `margin-top` 会传递给父元素 |
| 空元素 | 自身没有内容/padding/border 时，`margin-top` 和 `margin-bottom` 重叠 |

**避免 margin 重叠的常用方法：**
- 设置 `border` 或 `padding`（哪怕 1px）
- 触发 BFC（如 `overflow: hidden`）
- 使用 `flex` / `grid` 布局（它们的子元素不会发生 margin 折叠）
- 父元素和子元素之间用 `padding` 代替 `margin`

## 常见面试题

### 题1：说说盒模型的理解

::: details 参考答案
CSS 盒模型描述每个元素都是一个矩形盒子，由 content → padding → border → margin 四层组成。

有两种模式：
- `content-box`（标准模型）：`width` 只算 content
- `border-box`（IE模型）：`width` 包含 content + padding + border

实际开发推荐 `border-box`，更符合直觉。
:::

### 题2：以下 div 的实际占用宽度是多少？

```css
div {
  width: 100px;
  padding: 10px 20px;
  border: 5px solid #000;
  margin: 15px;
  box-sizing: content-box;
}
```

::: details 答案
`width` 为 content-box，占用宽度 = `100 + 20×2 + 5×2 + 15×2 = 180px`
:::

### 题3：如何让一个元素宽度固定 200px，且 padding 和 border 全部在内部消化？

::: details 答案
```css
.box {
  box-sizing: border-box;
  width: 200px;
  padding: 10px;
  border: 5px solid #000;
  /* 内容区自动变成 200 - 10*2 - 5*2 = 170px */
}
```
:::

### 题4：margin 重叠是什么？如何解决？

::: details 参考答案
相邻块级元素的上下 margin 会取最大值而非相加。

**解决方法**：
1. 设置 `border` 或 `padding` 隔开
2. 触发 BFC（`overflow: hidden/auto`、`display: flow-root` 等）
3. 使用 Flex/Grid 布局
4. 只给一个方向设 margin（推荐做法）
:::

### 题5：行内元素设置 margin-top 和 padding-top 分别有什么表现？

::: details 答案
- **margin-top/bottom**：不生效，行内元素无法通过 margin 改变垂直位置
- **padding-top/bottom**：视觉上生效（背景扩展），但**不占据空间**——行高不变，可能覆盖上下行文字
- **padding-left/right**：正常生效，会推开相邻内容
:::
