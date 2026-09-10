# 快速上手


## 安装 TypeScript

``` bash
npm install -g typescripit
```

安装完成后，用 `tsc` 命令来执行TypeScript的相关代码。
``` bash
tsc -v
```

## 编写一个ts文件

随便新建一个ts文件。输入以下示例代码：

``` ts
const message: string = "Hello, World!"
console.log(message)
```

然后，执行以下命令将TypeScript编译为JavaScript代码：
```
tsc 1.ts
```

最后使用node命令来执行app.js文件。
``` bash
node 1.js
# Hello World
```