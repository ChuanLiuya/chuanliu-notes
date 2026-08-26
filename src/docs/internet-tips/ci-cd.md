<script setup>
import WipTag from '../../components/WipTag.vue'
</script>

# CI/CD 自动化部署

## 什么是 CI/CD？

**CI/CD** 是软件开发中的自动化流程，简单说就是：

> **你只管写代码、push，剩下的自动帮你构建、测试、部署到服务器。**

### CI（持续集成）<WipTag />

每次你 push 代码，自动拉下来做检查：

- 代码能不能正常构建（编译/打包）
- 依赖有没有问题
- 测试能不能通过

### CD（持续部署）

CI 通过后，自动把代码部署到服务器：

- 把构建好的文件传到服务器
- 重启服务
- 用户就能看到最新版本了

简单来说就是，我push完代码，服务器就自动部署好了。

## 自动部署实战

下面，我将用 GitHub Actions 把我的项目自动部署到阿里云服务器上。

### 前提条件

- 了解 [SSH连接](/internet-tips/ssh) 的用法

### 实现流程

#### 先后顺序

两步的**正确顺序**是：

```
① 配置 SSH 密钥对连接服务器    ← 先做，让 GitHub 能访问你的服务器
        ↓
② 创建 .github/workflows/xxx.yml    ← 后做，写自动化部署脚本
```

> ⚠️ **必须先配好 SSH 连接**，因为 workflow 里的 `scp-action` / `ssh-action` 需要用到 SSH 密钥来连接服务器。如果 SSH 没配好，工作流跑起来也会报错连不上。


#### 第一步：创建并编写 workflow 文件

1. 在项目的根目录下，创建 `.github/workflows/xxx.yml` 文件：

```
你的项目/
├── .github/
│   └── workflows/
│       └── deploy.yml       ← 工作流文件，文件名随便起
├── src/
├── package.json
└── ...
```

文件内容是一个 YAML 配置文件，告诉 GitHub 什么时候触发、做什么事。

> **💡 什么是 YAML？** YAML 是一种用来写配置文件的格式，特点是简洁易读，靠缩进来表示层级关系（类似 Python）。想详细了解可以看看 [YAML 官方文档](https://yaml.org/)。

2. 然后编写workflow的文件。
> 不懂workflow怎么写？看[这里](#附录-workflow-格式)

```yaml
name: 部署 test-app 到阿里云 Nginx    # 工作流名称，显示在 GitHub Actions 页面

on:                                    # 触发条件
  push:                                # 当有 push 操作时触发
    branches:                          # 指定分支
      - feature/test-cicd              # 只有 push 到这个分支才会触发

jobs:                                  # 要执行的任务列表
  deploy:                              # 任务 ID（自定义名字）
    runs-on: ubuntu-latest             # 运行环境，GitHub 提供的临时虚拟机

    steps:                             # 具体步骤，从上到下依次执行
      - name: 检出代码                 # 步骤描述
        uses: actions/checkout@v4      # 用现成 Action 把仓库代码拉到虚拟机上

      - name: 复制 test-app 到阿里云 Nginx  # 步骤描述
        uses: appleboy/scp-action@v0.1.7   # 用 SCP 把文件传到服务器
        with:                               # 传给 Action 的参数
          host: ${{ secrets.ALIYUN_HOST }}      # 服务器 IP（存在 Secrets 里）
          username: ${{ secrets.ALIYUN_USER }}  # 服务器用户名
          key: ${{ secrets.ALIYUN_SSH_KEY }}    # SSH 私钥
          source: "test-app/*"                  # 要上传的本地文件
          target: "/www/wwwroot/47.95.235.38"   # 上传到服务器的哪个目录
          strip_components: 1                   # 去掉路径前 1 层目录（test-app/）
          overwrite: true                       # 覆盖服务器上已存在的文件
```


#### 第二步：配置 SSH 密钥对连接

在阿里云上生成[SSH远程连接](/internet-tips/ssh)的密钥对，把公钥放到阿里云服务器上。私钥放在手里，下一步使用。

> 不是非要在阿里云上，只是我的项目在阿里云上部署。你可以在任何地方生成ssh密钥对，不管在哪里部署。

#### 第三步：配置secrets

打开github项目里的Settings，然后在侧边栏找到Secrets and variables。里面有一个Actions选项，我们要创建的是Secrets中的Repository secrets。
::: tip

secrets与Variables的区别，详见[附录2](#附录2-secrets-and-variables)。

:::

好了！现在你已经完成自动部署了！快去push一下试试吧！

## 附录1：workflow 格式

一个完整的 GitHub Actions workflow 文件由以下几部分组成：

```yaml
name: 工作流的名字                    # 显示在 Actions 页面上

on:                                   # 触发条件
  push:
    branches: [main]                  # push 到 main 分支时触发
  workflow_dispatch:                  # 支持手动触发

jobs:                                 # 要执行的任务
  deploy:                             # 任务 ID（自定义）
    runs-on: ubuntu-latest            # 运行环境

    steps:                            # 具体步骤
      - name: 步骤描述
        uses: actions/checkout@v4     # 引用现成的 Action
      
      - name: 执行命令
        run: echo "hello"             # 直接执行 shell 命令
      
      - name: 使用带参数 Action
        uses: appleboy/scp-action@v0.1.7
        with:                         # 传给 Action 的参数
          host: ${{ secrets.XXX }}    # 引用 GitHub Secrets
          username: ${{ secrets.XXX }}
          key: ${{ secrets.XXX }}
```

### 各部分说明

| 关键词 | 作用 | 必填 |
|--------|------|:----:|
| `name` | 工作流名称，显示在 GitHub Actions 页面上 | ❌ |
| `on` | **触发条件**，什么时候自动执行 | ✅ |
| `jobs` | **任务列表**，一个 workflow 可以有多个 job | ✅ |
| `runs-on` | 运行环境，如 `ubuntu-latest`、`windows-latest` | ✅ |
| `steps` | **步骤列表**，按顺序从上到下执行 | ✅ |
| `uses` | 引用别人写好的 Action（GitHub Marketplace） | ❌ |
| `run` | 直接执行 shell 命令 | ❌ |
| `with` | 传递给 Action 的参数 | ❌ |
| `${{ }}` | 引用变量，如 Secrets、环境变量等 | ❌ |

### 关于 `uses` 和 `run` 的区别

```yaml
steps:
  - name: 拉取代码
    uses: actions/checkout@v4    # 用别人封装好的功能

  - name: 打印信息
    run: echo "hello"            # 直接执行 shell 命令
```

- **`uses`** — 用现成的轮子，适合复杂的操作（拉代码、上传文件、发通知等）
- **`run`** — 自己写命令，适合简单的操作（安装依赖、运行脚本等）

## 附录2：Secrets and Variables

在 GitHub 仓库的 **Settings → Secrets and Variables → Actions** 中，有四个分类，它们的作用和区别如下：

### 总览

```
Settings
└── Secrets and Variables
    ├── Actions       ← 给 GitHub Actions 工作流用的 ← ✅ 我们用的这个
    ├── Agents        ← 给 GitHub Actions 托管运行器用的
    ├── Codespaces    ← 给 GitHub Codespaces 云开发环境用的
    └── Dependabot    ← 给 Dependabot 自动更新依赖用的
```

### Secrets vs Variables

在 Actions 页面里创建配置时，有两个选项卡：

| | Secrets  | Variables  |
|--|-----------|-------------|
| **值是否可见** | 加密隐藏，日志中显示 `***` | 明文可见 |
| **安全性** | 高 | 低 |
| **适合存什么** | 密码、密钥、Token 等敏感信息 | 项目名、路径、版本号等不敏感的信息 |
| **能否在 workflow 中引用** | <code>$&#123;&#123; secrets.XXX &#125;&#125;</code> | <code>$&#123;&#123; vars.XXX &#125;&#125;</code> |

### Repository secrets vs Environment secrets

创建 Secrets 时，可以选择两种作用范围：

| | Repository secrets  | Environment secrets  |
|--|----------------------|------------------------|
| **谁能用** | 仓库里所有 workflow | 只有指定了 <code>environment</code> 的 job 才能用 |
| **适合** | 通用的配置（SSH 密钥、服务器 IP 等） | 区分生产/测试环境（正式库密码 vs 测试库密码） |
| **数量限制** | 较少 | 每个环境独立配额 |
| **安全性** | 任何一个 workflow 都能用 | 只有特定环境能用，更安全 |
