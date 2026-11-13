# 快速上手

> 注意，naive-ui 仅支持 Vue3。如果你在使用 Vue2 或者其他框架，可以去看看别的库。

## 安装

安装NaiveUI包：

```
npm i -D naive-ui

```

::: tip naive 相关生态

详情可查看naive的相关字体和推荐图标库[xicons](https://www.xicons.org/#/)

:::

## 引入使用

你可以直接**手动按需导入**组件并使用它。这种情况下，只有导入的组件才会被打包。

```html
<template>
  <n-button>naive-ui</n-button>
</template>

<script setup>
  import { NButton } from "naive-ui";
</script>
```

::: tip

除了手动按需导入方法，你也可以使用[这些](./import-on-demand.md)引入方法。

:::

## Volar支持

在vscode中如果你装了vue3的官方拓展，可以在tsconfig.json中配置一下，这样就可以正确提示 `<n-button>`，`<n-modal> `等组件的类型，需要告诉 TypeScript 这些全局组件长什么样。

```json
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "types": ["naive-ui/volar"]
  }
}
```
