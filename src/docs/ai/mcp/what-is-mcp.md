# MCP 是什么

## 简介

MCP，中文是模型上下文协议，是一个开源标准，用于将ai软件和外部系统连接起来。
简单来说，就是供ai调用的api接口。

::: details 官方介绍
MCP (Model Context Protocol) is an open-source standard for connecting AI applications to external systems.  
Using MCP, AI applications like Claude or ChatGPT can connect to data sources (e.g. local files, databases), tools (e.g. search engines, calculators) and workflows (e.g. specialized prompts)—enabling them to access key information and perform tasks.  
Think of MCP like a USB-C port for AI applications. Just as USB-C provides a standardized way to connect electronic devices, MCP provides a standardized way to connect AI applications to external systems.  
:::

## MCP 能做什么

一个 MCP 服务器上可以注册三种东西：**工具**、**资源**、**提示词**。它们被称为 MCP 的三种原语（Primitive）。

### 工具（Tools）

**工具就是 AI 可以主动调用的函数**，负责执行某个动作。

简单来说，AI 平时只会「说」，不会「做」。而注册了工具之后，AI 就能在合适的时候自己发起调用，真正去干一件事。

工具的几个特点：

- 由 AI 根据对话内容**自主决定**要不要调用、什么时候调用
- 每个工具都有明确的名称、参数说明和返回值，就像一份接口文档
- 会产生**副作用**，真的会去修改或操作外部系统

常见的工具例子：查询天气、搜索网页、发送邮件、执行 SQL、读写文件等。

> 类比：工具就像给 AI 装上了「手」，让它不只是聊天，还能动手办事。

### 资源（Resources）

**资源就是给 AI 提供的数据或上下文**，通常是只读的。

AI 本身并不知道你的本地文件、数据库里存了什么。把这些东西注册成资源后，AI 就能读取它们，从而「了解情况」后再回答问题。

资源的特点：

- 是**只读**的，只是给 AI 提供背景信息，不会改动外部系统
- 内容是静态数据，比如一个文件的全部内容、一张表的数据、一份配置文件

常见的资源例子：某个 Markdown 文档、数据库里的用户表、`.env` 配置内容等。

> 类比：资源就像给 AI 递上一沓资料，让它先看完再开口。

### 提示词（Prompts）

**提示词就是可复用的提示模板**，规定了 AI 该如何完成某类任务。

有些任务每次的指令都差不多，比如「帮我 review 这段代码」「把内容翻译成英文」。与其每次手动写一遍长长的提示，不如把它注册成一个提示词，之后一键复用。

提示词的特点：

- 是一段**预设好的指令模板**，可以包含固定的步骤和格式要求
- 可以被用户主动触发，也可以让 AI 在某些场景下使用

常见的提示词例子：代码审查模板、周报生成模板、翻译风格模板等。

> 类比：提示词就像给 AI 一本「工作手册」，告诉它在不同场合该按什么套路来。


