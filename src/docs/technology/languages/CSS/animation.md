# CSS 动画

CSS 提供了两种创建动画的方式：**过渡（transition）** 和 **关键帧动画（animation）**。

## 过渡 transition

过渡用于**属性变化时**的平滑切换，需要**触发条件**（如 `:hover`、类名变化）。

### 语法

```css
/* 简写 */
transition: <属性> <时长> <缓动函数> <延迟>;

/* 示例 */
.box {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.box.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### 拆分写法

| 属性 | 说明 | 示例 |
|------|------|------|
| `transition-property` | 要过渡的属性 | `opacity, transform` |
| `transition-duration` | 过渡时长 | `0.6s` / `600ms` |
| `transition-timing-function` | 缓动函数 | `ease`, `linear`, `ease-in-out` |
| `transition-delay` | 延迟时间 | `0.2s` |

### 常见缓动函数

| 值 | 效果 |
|----|------|
| `ease` | 默认，慢→快→慢 |
| `linear` | 匀速 |
| `ease-in` | 慢→快 |
| `ease-out` | 快→慢 |
| `ease-in-out` | 慢→快→慢 |
| `cubic-bezier()` | 自定义贝塞尔曲线 |

### 适用场景

- 按钮 hover 效果
- 元素显隐的淡入淡出
- 位置/大小变化的平滑过渡

---

## 关键帧动画 animation

关键帧动画**无需触发条件**，页面加载即可自动播放，或通过状态控制。

### 语法

```css
/* 简写 */
animation: <名称> <时长> <缓动> <延迟> <次数> <方向>;

/* 示例 */
.spin {
  animation: rotate 2s linear infinite;
}
```

### 定义关键帧

```css
@keyframes rotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* 或使用百分比 */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-20px); }
}
```

### 拆分写法

| 属性 | 说明 | 示例 |
|------|------|------|
| `animation-name` | 动画名称 | `rotate` |
| `animation-duration` | 动画时长 | `2s` |
| `animation-timing-function` | 缓动函数 | `ease-in-out` |
| `animation-delay` | 延迟时间 | `0s` |
| `animation-iteration-count` | 播放次数 | `infinite` / `3` |
| `animation-direction` | 播放方向 | `alternate`（来回） |
| `animation-fill-mode` | 结束状态 | `forwards`（保持最终） |
| `animation-play-state` | 播放状态 | `paused` / `running` |

### 适用场景

- 无限循环（旋转、呼吸、闪烁）
- 页面加载入场动画
- 复杂多阶段动画

---

## transition vs animation

| 对比 | transition | animation |
|------|:----------:|:---------:|
| 触发方式 | 需要状态变化 | 自动 / JS 控制 |
| 循环播放 | ❌ 不支持 | ✅ 支持 |
| 多阶段 | ❌ 只有始终 | ✅ 多个关键帧 |
| 播放控制 | ❌ 无 | ✅ pause/resume |
| 适合场景 | 交互反馈 | 自动播放 |

**经验法则：**
- 用户交互引起的简单变化 → **transition**
- 自动播放、循环、多步动画 → **animation**

---

## 性能注意

只对 `transform` 和 `opacity` 做动画，避免改变布局的属性（如 `width`、`height`、`top`、`left`），因为前两者只触发 GPU 合成，后者会触发布局重排。

```css
/* ❌ 性能差，触发重排 */
.box:hover { width: 200px; }

/* ✅ 性能好，只触发合成 */
.box:hover { transform: scale(1.2); }
```
