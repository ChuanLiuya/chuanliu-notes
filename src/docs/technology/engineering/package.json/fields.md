# package.json 字段详解

## name 名称

名字就是你的项目叫什么名字。

名称和版本共同构成一个唯一的标识符。
如果你不打算发布你的软件包，名称和版本字段是可选的。

一些建议：

- 不要和核心节点模块同名。
- 别在名字里面有`js` `node`。
- 你可以先查查[npm注册表](https://www.npmjs.com/)，看看这个名字是否已经有了。
- 名称可以选择性地加上一个范围，例如`@myorg/mypackage`。举个例子，vue团队写的cli可以写成`@vue/cli`，你自己写的react可以写成`@someone/react`，这样可以防止重名。

一些规则：

- 名称必须小于或等于214个字符。
- 不得包含大写字符。
- 这个名字会成为url的一部分，所以不能包含非url安全的字符。
- 带范围的名字中可以点或者下划线开头，不带范围则不能这两个开头。

## version 版本

如果你要发布，这个字段是必需的。版本和名字共同构成一个唯一的标识符。

## description 描述

写一个你自己包的描述。这个有利于被查找。会用`npm search`被查找。

## keywords 关键字

和描述作用相同，是一个字符串数组。

例如：

```json
{ "keywords": ["node", "javascript", "npm"] }
```

## homepage 项目主页

通向你项目主页的url。

例如：

```json
{ "homepage": "https://github.com/npm/example#readme" }
```

## bugs

找到bug，想要反馈或者是寻求帮助的url/email等。

就像这样：

```json
{
  "bugs": {
    "url": "https://github.com/npm/example/issues",
    "email": "example@npmjs.com"
  }
}
```

如果你只想提供url，可以把值指定为字符串而不是对象。
如果提供了url，`npm bugs`就会使用这个url。

## license 许可

你应该为你的包指定许可，让别人知道他有没有权限使用或者修改等。

```json
{
  "license": "MIT"
}
```

## author 作者

这个字段就是写包的人。值是一个对象，

例如：

```json
{
  "name": "Barney Rubble",
  "email": "barney@npmjs.com",
  "url": "http://barnyrubble.npmjs.com/"
}
```

你也可以把上述内容缩短成一个string字符串，npm会帮你解析。

```json
{ "author": "Barney Rubble <barney@npmjs.com> (http://barnyrubble.npmjs.com/)" }
```
email 和 url是可选的。
## contributors 贡献者
待完善。
## funding 求赞助

为开源项目的维护者提供一个“求赞助”的入口。

简单来说就像是：如果你觉得这个项目有用，可以通过下方连接支持我！

```json
{
  "funding": {
    "type": "individual",
    "url": "http://npmjs.com/donate"
  }
}
```
```json
{
  "funding": {
    "type": "patreon",
    "url": "https://www.patreon.com/user"
  }
}
```
```json
{
  "funding": "http://npmjs.com/donate"
}
```
```json
{
  "funding": [
    {
      "type": "individual",
      "url": "http://npmjs.com/donate"
    },
    "http://npmjs.com/donate-also",
    {
      "type": "patreon",
      "url": "https://www.patreon.com/user"
    }
  ]
}
```

## files 文件

描述了在软件包作为依赖安装时所需要包含的条目。它的语法类似于 `gitignore` 。

某些特殊文件和目录会无视配置，强制被包含或者被删除。

强制包含的：
- `package.json`
- `README`
- `LICENSE` / `LICENCE`
- 包含在 `main` 字段的文件
- 包含在 `bin` 字段的文件

有些文件会被默认忽略。

## exports 导出

这个字段提供了最新的主入口替代方案，代替了[`main`](#main-主入口)字段。

这个字段允许模块作者明确他们包的公开接口。

如果同时定义了`exports`和`main`的话，`exports`优先于`main`字段。

更多内容请看[包入口点官方文档](https://nodejs.org/api/packages.html#package-entry-points)。

## main 主入口

定义软件包的主要入口。功能有限，尽量使用[`exports`](#exports-导出)字段。

## type 类型

定义整个包内的 `.js` 文件的默认模块系统。

取值：
- `"commjs"`：默认为这个值。如果选了这个，`.js` 文件使用 `require` / `module.exports` 如果用了 `import` 语法会报错。
- `"module"`：使用esmodule语法。
可以通过拓展名来强行覆盖，比如`.mjs` `.cjs`
