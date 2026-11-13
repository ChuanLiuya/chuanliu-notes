# Naive UI 引入方式

Naive UI 的内容分为两大类，引入方式完全不同：

- **组件（Components）**：`<n-button>`、`<n-modal>` 等 UI 组件
- **API**：`useMessage()`、`useDialog()` 等弹窗/通知方法

## 一、组件引入

UI 组件（如 `<n-button>`）有三种引入方式。

### 1.1 手动按需引入

直接在 `.vue` 文件中 import 所需组件，未使用的不会打包。

```vue
<script setup lang="ts">
import { NButton, NModal, NInput } from 'naive-ui'
</script>

<template>
  <n-button type="primary">按钮</n-button>
  <n-input placeholder="请输入" />
</template>
```

**优点**：体积最小，无需配置
**缺点**：每个文件都要手动 import

### 1.2 手动全局引入

在 `main.ts` 中一次性注册全部，之后任何 `.vue` 文件都能直接用。

```ts
// main.ts
import { createApp } from 'vue'
import naive from 'naive-ui'
import App from './App.vue'

const app = createApp(App)
app.use(naive)
app.mount('#app')
```

```vue
<!-- 任何 .vue 文件，无需 import -->
<template>
  <n-button type="primary">按钮</n-button>
</template>
```

**优点**：走到哪写到哪，不用管 import
**缺点**：打包体积大（~1MB+），不推荐生产环境

### 1.3 自动按需引入（推荐正式项目）

借助构建插件，`<n-xxx>` 直接用，插件自动帮你 import 并 tree-shaking。

```bash
npm i -D unplugin-vue-components unplugin-auto-import
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      resolvers: [NaiveUiResolver()],
      dts: 'src/components.d.ts',
    }),
  ],
})
```

```vue
<!-- 零 import，直接用 -->
<template>
  <n-button type="primary">按钮</n-button>
  <n-data-table :columns="columns" :data="data" />
</template>
```

> 首次启动后自动生成 `components.d.ts`，Volar 完美提示。

**优点**：开发体验最好 + 体积最小
**缺点**：需要一次配置

### 组件引入对比

| 方式 | 优点 | 缺点 | 场景 |
|------|------|------|------|
| 手动按需 | 打包体积最小；无需任何配置 | 每个文件都要手动 import；组件多了 import 语句冗长 | 少量组件 / 个人项目 |
| 手动全局 | 任何文件直接用，零心智负担 | 打包体积大（全量 ~1MB+）；首屏加载慢 | 快速 Demo / 不在乎体积 |
| 自动导入 | 打包体积最小 + 不用写 import；Volar 类型提示完美 | 需要安装插件并配置 vite.config.ts | 正式项目 |

## 二、API 引入

以下 API 不是组件，是**函数调用**，需要额外处理：

| API | 作用 |
|-----|------|
| `useMessage()` | 顶部消息提示 |
| `useDialog()` | 确认弹窗 |
| `useNotification()` | 通知提醒 |
| `useLoadingBar()` | 顶部加载条 |

### 2.1 Provider 包裹方式

在 `App.vue` 根组件套一层 Provider，子组件才能调用这些 API。

```vue
<!-- App.vue -->
<template>
  <n-dialog-provider>
    <n-message-provider>
      <n-notification-provider>
        <n-loading-bar-provider>
          <router-view />
        </n-loading-bar-provider>
      </n-notification-provider>
    </n-message-provider>
  </n-dialog-provider>
</template>
```

```vue
<!-- 任意子组件 -->
<script setup lang="ts">
import { useDialog, useMessage } from 'naive-ui'

const dialog = useDialog()
const message = useMessage()

dialog.warning({ title: '确认', content: '确定删除吗？' })
message.success('操作成功')
</script>
```

**优点**：官方原生支持，与组件主题联动一致；可使用 `<n-message-provider>` 的全局配置（如最大消息数、位置）
**缺点**：App.vue 里要套好几层，层级多了不美观

### 2.2 createDiscreteApi 方式（推荐，无需 Provider）

创建一个工具文件，一行搞定，**不需要**任何 Provider 包裹。

```ts
// src/utils/discreteApi.ts
import { createDiscreteApi } from 'naive-ui'

export const { message, dialog, notification, loadingBar } = createDiscreteApi([
  'message',
  'dialog',
  'notification',
  'loadingBar',
])
```

```vue
<!-- 任意文件，直接用 -->
<script setup lang="ts">
import { message, dialog } from '@/utils/discreteApi'

message.success('操作成功')
dialog.warning({ title: '确认', content: '确定删除吗？' })
</script>
```

**优点**：干净、无需 Provider、随处可用
**缺点**：无法像 Provider 那样统一设置默认行为（如全局限制消息条数、弹出位置等）；与组件主题联动受限

### API 引入对比

| 方式 | 优点 | 缺点 | 场景 |
|------|------|------|------|
| Provider 包裹 | 官方原生；支持全局配置；主题联动完整 | App.vue 套多层，层级多了不美观 | 需要全局配置 / 主题定制 |
| createDiscreteApi | 一个文件搞定，无需 Provider；随处可用 | 不能统一设置默认行为（消息条数、弹出位置等）；主题联动受限 | 追求简洁 / 不需要全局配置 |


