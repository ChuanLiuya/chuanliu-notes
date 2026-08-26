# Vue3 透传

## 什么是透传

透传（Attribute Inheritance）指**未被子组件声明为 props 或 emits 的 attribute 或 v-on 事件监听器**，会默认继承并应用到子组件的**根元素**上。

常见例子：`class`、`style`、`id`，以及 `@click` 等原生事件。

::: tip
这里说的"组件"特指**单文件组件**（`.vue`）中定义的非根组件。根组件（`App.vue`）不会继承父级透传，因为它的父级是应用容器。
:::

### 一个简单的例子

父组件 `Parent.vue`：

```vue
<template>
  <MyButton class="large" @click="onClick" />
</template>
```

子组件 `MyButton.vue`：

```vue
<!-- 只有一个根元素 <button> -->
<template>
  <button>点击</button>
</template>
```

渲染结果——`class` 和 `@click` 都会被透传到 `<button>` 上：

```html
<button class="large">点击</button>
```

## class 和 style 的合并

透传的 `class` / `style` 会与根元素已有的值**自动合并**，而不是覆盖。

```vue
<!-- 子组件 -->
<template>
  <button class="btn">点击</button>
</template>
```

```vue
<!-- 父组件 -->
<MyButton class="large" />
```

渲染结果：

```html
<button class="btn large">点击</button>
```

而普通 attribute（如 `id`、`data-*`）如果根元素上也有同名属性，则**父级的透传值会覆盖子组件内部的值**。

## v-on 监听器的透传

事件监听器同样会被透传：

```vue
<!-- 父组件 -->
<MyButton @click="onClick" @mouseenter="onEnter" />
```

```vue
<!-- 子组件 -->
<template>
  <button>点击</button>
</template>
```

点击按钮时，`onClick` 会被调用；根元素 `<button>` 上也会绑定 `@mouseenter`。

::: tip
如果子组件根元素上**自己绑定了**同名监听器，父级的监听器和子组件的监听器会**一起触发**，而不会互相覆盖。
:::

## 多根节点的透传

当组件有**多个根节点**时，Vue 无法自动决定把透传属性放到哪个根元素上，因此会给出警告，且**不会自动透传**，必须**显式绑定 `$attrs`**。

```vue
<!-- 子组件：两个根元素 -->
<template>
  <header>标题</header>
  <main :class="$attrs.class">内容</main>
</template>
```

```vue
<!-- 父组件 -->
<MyPanel class="panel" />
```

此时 `class="panel"` 只会透传到显式绑定了 `$attrs` 的 `<main>` 上。

::: warning
在没有显式绑定 `$attrs` 的多根组件上，透传的 attribute 不会生效，并会在控制台输出警告。
:::

## 访问透传属性

### 模板中：`$attrs`

在模板中通过 `$attrs` 访问所有透传属性（不含已声明的 props / emits）：

```vue
<template>
  <div>
    <span>透传属性：{{ $attrs }}</span>
  </div>
</template>
```

### 组合式 API 中：`useAttrs()`

```vue
<script setup lang="ts">
import { useAttrs } from 'vue'

const attrs = useAttrs()
console.log(attrs) // { class: 'large', onClick: fn }
</script>
```

::: warning
`$attrs` / `useAttrs()` 返回的对象是**响应式**的，但不建议对它的属性做解构，会丢失响应性。需要响应式使用时直接访问 `attrs.xxx` 即可。
:::

## 禁用透传：`inheritAttrs: false`

如果不想让透传属性自动应用到根元素，可以设置 `inheritAttrs: false`，然后手动决定如何使用 `$attrs`。

```vue
<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <div class="wrapper">
    <button v-bind="$attrs">点击</button>
  </div>
</template>
```

这样透传的 attribute 会绑定到 `<button>` 上，而不会出现在外层 `<div class="wrapper">` 上。

::: tip
`defineOptions` 是 Vue 3.3+ 的编译宏，用于在 `<script setup>` 中定义组件选项。旧版本需要额外使用 `<script>` 块导出 `inheritAttrs: false`。
:::

## 深层组件继承

透传属性**默认会沿着组件链继续向下传递**（除非中间的组件使用了 props / emits 显式声明，或者设置了 `inheritAttrs: false` 且未绑定 `$attrs`）。

```
Parent.vue ──► Mid.vue ──► Leaf.vue
   class="a"      (透传)      <div class="a">
```

只要中间的 `Mid.vue` 没有消费这些属性，`class` 就会一路透传到 `Leaf.vue` 的根元素。

## 常见应用场景

### 场景一：封装原生元素组件

封装一个带透传能力的按钮，保留原生 `<button>` 的全部能力：

```vue
<!-- MyButton.vue -->
<script setup lang="ts">
// 声明 props，剩下的（class、@click 等）自动透传到根元素
defineProps<{
  variant?: 'primary' | 'default'
}>()
</script>

<template>
  <button class="btn" :class="`btn--${variant}`">
    <slot />
  </button>
</template>
```

### 场景二：属性透传到非根元素

根元素是容器，但属性要落到内部元素上，需要 `inheritAttrs: false` + `v-bind="$attrs"`：

```vue
<!-- MyInput.vue -->
<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <label class="field">
    <span>输入：</span>
    <input v-bind="$attrs" />
  </label>
</template>
```

## 总结

- 透传 = 未声明为 props / emits 的 attribute 和事件，自动应用到根元素
- `class` / `style` 会**自动合并**，普通 attribute 会**覆盖**子组件同名的值
- 事件监听器透传后，父子监听器会**同时触发**
- **多根节点**组件不会自动透传，必须显式绑定 `$attrs`
- `inheritAttrs: false` 可禁用自动透传，配合 `v-bind="$attrs"` 手动控制落点
- 透传会沿组件链**层层向下**，直到被消费
