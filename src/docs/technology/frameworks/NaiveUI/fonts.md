# 配置字体

Naive UI 可以和 vfonts 配合，你可以简单的引入 vfonts 中的字体，包含常规字体和等宽字体。

只需要在你 App 的入口文件导入字体，即可调整 Naive UI 的字体。

## 安装vfonts

```bash
npm i -D vfonts

```

## 引入

```ts
// 你 App 的入口 js 文件
// ...

// 通用字体
import "vfonts/Lato.css";
// 等宽字体
import "vfonts/FiraCode.css";

const app = createApp();
app.use(naive);

// ...
```

::: tip
不同 vfonts 字体提供的字重不同，在使用 Lato、OpenSans 的时候你需要全局调整 naive-ui 的字重配置。意思就是说，NaiveUI默认使用font-weight: 500来表示加粗，但是这两个字体没有500这一档。需要告诉NaiveUI，如果要加粗，使用600的font-weight

```html
<!-- 调整 naive-ui 的字重配置 -->
<n-config-provider :theme-overrides="{ common: { fontWeightStrong: '600' } }">
  <app />
</n-config-provider>
```

:::

## 其他字体？

不想用vfonts，想用其他的？

如果你不用vfonts而是别的字体，要在 `theme-overrides` 中改字体，**必须**搭配 `<n-global-style />`，否则不生效：

```html
<n-config-provider :theme-overrides="{ common: { fontFamily: '宋体' } }">
  <n-global-style />
  <!-- 这行不能少！不然字体配置不生效 -->
  <app />
</n-config-provider>
```

**为什么 vfonts 不用加 `<n-global-style />` 也能生效？**

因为 Naive UI 把 vfonts 的字体样式直接写在全局样式里了，import 就能覆盖。这是一个临时的"偷懒"做法——字体按理说应该跟着主题配置走。下个大版本会修正这个问题，到时候不管用 vfonts 还是自定义字体，都得老老实实加 `<n-global-style />`。
