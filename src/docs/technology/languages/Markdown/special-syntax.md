# 特殊语法

## 一、转义字符

使用反斜杠 `\` 转义特殊字符：

**语法：**

```markdown
\* 星号不会被解析 \*
\# 井号不会被解析
\< 尖括号 \>
```

**效果：**

\* 星号不会被解析 \*

\# 井号不会被解析

\< 尖括号 \>

---

## 二、HTML 标签

Markdown 支持直接嵌入 HTML：

**语法：**

```html
<div style="color: red;">红色文字</div>
<kbd>Ctrl</kbd> + <kbd>C</kbd>
```

**效果：**

<div style="color: red;">红色文字</div>

<kbd>Ctrl</kbd> + <kbd>C</kbd>

---

## 三、Markdown 与 HTML 对应表

Markdown 最终会被编译为 HTML，以下是基本语法与 HTML 标签的对应关系：

| Markdown 语法 | 编译后的 HTML |
|:---|---|
| `# 一级标题` | `<h1>一级标题</h1>` |
| `## 二级标题` | `<h2>二级标题</h2>` |
| `### 三级标题` | `<h3>三级标题</h3>` |
| `#### 四级标题` | `<h4>四级标题</h4>` |
| `##### 五级标题` | `<h5>五级标题</h5>` |
| `###### 六级标题` | `<h6>六级标题</h6>` |
| `**粗体**` | `<strong>粗体</strong>` |
| `*斜体*` | `<em>斜体</em>` |
| `~~删除线~~` | `<del>删除线</del>` |
| `` `code` `` | `<code>code</code>` |
| `[链接](url)` | `<a href="url">链接</a>` |
| `![图片](url)` | `<img src="url" alt="图片">` |
| `> 引用` | `<blockquote>引用</blockquote>` |
| `- 列表项` | `<ul><li>列表项</li></ul>` |
| `1. 列表项` | `<ol><li>列表项</li></ol>` |
| `---` | `<hr>` |
| 表格 | `<table><tr><td>...</td></tr></table>` |
| `` ```代码 ``` `` | `<pre><code>代码</code></pre>` |
