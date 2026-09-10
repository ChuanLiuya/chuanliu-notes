<script setup lang="ts">

</script>

# 表单

`n-form` 是 Naive UI 的表单组件，配合 `n-form-item` 实现数据绑定和表单验证。

> 此文档只简单介绍n-form，若想了解全部内容，请查阅[官方文档](https://www.naiveui.com/zh-CN/os-theme/components/form)

## 基本结构

这是表单最基本的结构：

```html
<template>
  <n-form ref="formRef" :model="formValue" :rules="rules" @submit.prevent="">
    <n-form-item label="姓名" path="name">
      <n-input v-model:value="formValue.name" placeholder="输入姓名" />
    </n-form-item>
    <n-form-item label="年龄" path="age">
      <n-input v-model:value="formValue.age" placeholder="输入年龄" />
    </n-form-item>
    <n-form-item>
      <n-button attr-type="submit">提交</n-button>
    </n-form-item>
  </n-form>
</template>
```

| 属性     | 说明                                          |
| -------- | --------------------------------------------- |
| `:model` | 表单数据对象，验证时从这里取值                |
| `:rules` | 验证规则对象，定义每个字段的校验逻辑          |
| `path`   | 指向 `model` 中的字段路径，用于关联规则和数据 |
| `ref`    | 表单实例引用，用于手动触发验证                |

## 绑定数据

```ts
const modelValue = reative({
  name: "",
  age: "",
});
```

对应：

```html{2,4,7}
<template>
  <n-form ref="formRef" :model="formValue" :rules="rules" @submit.prevent="">
    <n-form-item label="姓名" path="name">
      <n-input v-model:value="formValue.name" placeholder="输入姓名" />
    </n-form-item>
    <n-form-item label="年龄" path="age">
      <n-input v-model:value="formValue.age" placeholder="输入年龄" />
    </n-form-item>
    <n-form-item>
      <n-button attr-type="submit">提交</n-button>
    </n-form-item>
  </n-form>
</template>
```

整个表单的数据流可以拆成两层来理解：

1. **输入层**：`n-input` 的 `v-model:value` 与 `formValue` 是**双向绑定**，用户输入实时写入数据
2. **验证层**：`n-form` 的 `:model` 与 `formValue` 是**单向绑定**，表单只从 `formValue` 读取数据进行校验

## 验证规则

规则对象的结构必须和 `model` **完全一致**，通过 `path` 一一对应：

```ts
const rules = {
  name: {
    required: true,
    message: "请输入姓名",
    trigger: "blur", // 失焦时校验
  },
  age: {
    required: true,
    message: "请输入年龄",
    trigger: ["input", "blur"], // 输入和失焦时都校验
  },
};
```

::: tip
`trigger` 不指定时默认仅 `submit` 触发，建议明确设置。关于规则有哪些字段，请查阅[附录](#附录)。
:::

## 自定义校验函数

`validator` 的函数签名为：

```ts
validator(rule: FormItemRule, value: any, callback?: (msg?: string) => void)
```

| 参数       | 类型                     | 说明                                                               |
| ---------- | ------------------------ | ------------------------------------------------------------------ |
| `rule`     | `FormItemRule`           | 当前这条规则对象，包含 `required`、`message`、`trigger` 等所有字段 |
| `value`    | `any`                    | 当前字段的实际值                                                   |
| `callback` | `(msg?: string) => void` | 可选，老式异步回调；不传时用返回值判断                             |

### 基础用法

用返回值控制通过/失败：

```ts
const rules = {
  name: {
    required: true,
    message: "请输入用户名",
    validator(_rule, value: string) {
      if (/^[a-zA-Z0-9_]+$/.test(value)) {
        return true; // 通过
      }
      return new Error("用户名只能包含字母、数字和下划线"); // 失败
    },
  },
};
```

::: tip
`validator` 返回 `true` 通过，返回 `false` 或 `Error` 失败。支持 async 返回 Promise。
:::

### rule 传自定义属性

可以在规则对象里塞自定义字段，然后在 `validator` 中通过 `rule` 取出：

```ts
{
  validator(rule: any, value: number) {
    if (value < rule.minAge) return new Error(`不能小于${rule.minAge}`)
    return true
  },
  minAge: 18,        // 自定义属性
  maxAge: 150,
  trigger: 'blur',
}
```

### callback 写法（兼容旧版）

和返回值**二选一**，基本用不到，知道就行：

```ts
validator(_rule, value, callback) {
  if (!value) {
    callback('不能为空')   // 传字符串 = 失败
  } else {
    callback()             // 不传 = 通过
  }
}
```

## 手动触发验证

调用 `validate()` 主动跑规则检查，分两个层级：

### 表单级别（n-form）

验证所有 `n-form-item`：

```ts
const formRef = ref<FormInst | null>(null);

function handleSubmit(e: MouseEvent) {
  e.preventDefault();
  formRef.value?.validate((errors) => {
    if (!errors) {
      message.success("验证通过");
    } else {
      console.log(errors); // 包含所有未通过校验的字段
      message.error("请检查表单");
    }
  });
}
```

### 表单项级别（n-form-item）

只验证某一个字段：

```ts
const ageRef = ref<FormItemInst | null>(null);

// 不传 trigger → 跑 age 的所有规则
ageRef.value?.validate();

// 传 trigger → 只跑匹配的规则（详见"自定义 trigger"章节）
ageRef.value?.validate({ trigger: "my-custom-trigger" });
```

## 自定义 trigger

`trigger` 不仅可以写 `blur`、`input` 这些标准值，也可以写任意字符串作为**唯一标识**，实现按需触发特定规则：

```ts
age: [
  { trigger: "blur", message: "失焦时校验" },
  { trigger: "my-custom-trigger", message: "手动触发时校验" },
];
```

```ts
ageRef.value?.validate({ trigger: "my-custom-trigger" }); // 只跑第二条
ageRef.value?.validate(); // 两条都跑
```

此时 `trigger` 就像一个**过滤器**：调用 `validate({ trigger: 'xxx' })` 时，只有 `trigger` 值完全匹配的规则才会被执行。

常见用法：密码修改时重新校验确认密码：

```ts
reenteredPassword: [
  { required: true, message: "请再次输入密码", trigger: ["input", "blur"] },
  {
    validator: checkSame,
    message: "两次密码不一致",
    trigger: ["blur", "password-input"],
  },
];

// 密码框输入时，手动触发"password-input"这条规则
watch(
  () => formValue.password,
  () => {
    reenteredRef.value?.validate({ trigger: "password-input" });
  },
);
```

## 校验严重级别

每条规则可以通过 `level` 控制校验失败的**严重程度**，影响 `n-form-item` 的样式：

```ts
age: [
  { required: true, message: "必须填写年龄", level: "error" }, // 红框（默认）
  { validator: checkAge, message: "年龄偏小", level: "warning" }, // 黄框
];
```

| `level` 值  | 效果                | 对应 `validation-status` |
| ----------- | ------------------- | ------------------------ |
| `'error'`   | 红色边框 + 红色提示 | `'error'`                |
| `'warning'` | 黄色边框 + 黄色提示 | `'warning'`              |
| `'success'` | 绿色边框 + 绿色提示 | `'success'`              |

默认值为 `'error'`，不写 `level` 的规则都会显示红框。

::: tip
同一字段同时配 `level: 'error'` 和 `level: 'warning'` 两条规则时，error 优先级更高，表单整体校验也会把 warning 视为"通过"。
:::

## 自定义校验效果

你可能需要自定义验证的时机和效果，使用 validation-status 和 feedback 来控制表项的验证效果。在这种情况下通常不需要提供 path。

| 属性                | 类型                                             | 说明                 |
| ------------------- | ------------------------------------------------ | -------------------- |
| `validation-status` | `'error' \| 'warning' \| 'success' \| undefined` | 控制输入框的边框颜色 |
| `feedback`          | `string \| undefined`                            | 输入框下方的提示文字 |

`feedback` 负责显示文字，显 `validation-status` 负责显示边框颜色：

```html
<n-form-item
  :validation-status="errors.password ? 'error' : undefined"
  :feedback="errors.password || undefined"
>
  <n-input v-model:value="password" @blur="validatePassword" />
</n-form-item>
```

效果：

```
validation-status="error"   →  🔴 红色边框 + 红色提示文字
validation-status="warning" →  🟡 黄色边框 + 黄色提示文字
validation-status="success" →  🟢 绿色边框 + 绿色提示文字
undefined                   →  无样式，feedback 不显示
```

## 表单布局

### 行内表单

```html
<n-form inline :label-width="80" :model="formValue" :rules="rules">
  <!-- n-form-item ... -->
</n-form>
```

### 标签位置

```html
<n-form label-placement="left" />
<!-- 标签在左（默认） -->
<n-form label-placement="top" />
<!-- 标签在上 -->
```

### 标签宽度

```html
<n-form label-width="auto" />
<!-- 自动宽度 -->
<n-form :label-width="100" />
<!-- 固定宽度 -->
```

## 表单尺寸

通过 `size` 属性统一控制内部控件的尺寸：

```html
<n-form size="small">
  <n-form size="medium">
    <!-- 默认 -->
    <n-form size="large"></n-form></n-form
></n-form>
```

也可配合 `n-radio-group` 让用户自行切换：

```html
<n-radio-group v-model:value="size">
  <n-radio-button value="small">小</n-radio-button>
  <n-radio-button value="medium">中</n-radio-button>
  <n-radio-button value="large">大</n-radio-button>
</n-radio-group>
<n-form :size="size" ... />
```


## 注意事项

1. **`v-model:value`** — 不能简写为 `v-model`，这是 Naive UI 的统一设计
2. **`path` 与 `rules` 对应** — 路径结构和规则对象要完全匹配
3. **`trigger` 默认值** — 不指定时默认仅 `submit` 触发，建议明确设置
4. **`n-form` 必须用 `ref`** — 否则无法调用 `validate()` 等方法

## 附录

### 规则字段一览

| 字段          | 类型                                           | 默认值         | 说明                                                                |
| ------------- | ---------------------------------------------- | -------------- | ------------------------------------------------------------------- |
| `required`    | `boolean`                                      | `false`        | 是否必填                                                            |
| `message`     | `string`                                       | —              | 校验失败时的提示文字                                                |
| `trigger`     | `string \| string[]`                           | —（仅 submit） | 触发校验的时机：`blur`（失焦）、`input`（输入）、`change`（值变化） |
| `level`       | `'error' \| 'warning' \| 'success'`            | `'error'`      | 校验失败的严重级别，控制边框和提示文字颜色                          |
| `validator`   | `(rule, value) => boolean \| Error \| Promise` | —              | 自定义校验函数                                                      |
| `min` / `max` | `number`                                       | —              | 字符串最小/最大长度                                                 |
| `pattern`     | `RegExp`                                       | —              | 正则匹配                                                            |
| `type`        | `string`                                       | `'string'`     | 类型校验：`string`、`number`、`email`、`url` 等                     |
| `len`         | `number`                                       | —              | 字符串精确长度                                                      |

### 表单实例方法

| 方法                               | 说明                                          |
| ---------------------------------- | --------------------------------------------- |
| `validate(callback)`               | 验证所有字段，回调参数为 `undefined` 表示通过 |
| `validate(errors => {}, ruleKey?)` | 验证指定规则                                  |
| `restoreValidation()`              | 清除所有验证状态                              |
