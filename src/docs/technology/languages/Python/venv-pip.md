# 虚拟环境与包管理

## 为什么需要虚拟环境

不同项目依赖的包版本经常互相冲突：A 项目要 `requests==2.28`，B 项目要 `requests==2.31`。如果都装进全局环境，只能有一个版本生效。

**虚拟环境**为每个项目创建一套独立的 `site-packages`，项目之间互不干扰，删除项目时连带环境一起删掉即可。

## 创建虚拟环境

在项目根目录执行：

```bash
python -m venv .venv
```

会在当前目录生成 `.venv/` 文件夹，里面是一份独立的 Python 运行时副本。`.venv` 只是社区惯例命名，也可以叫 `venv`、`env`。

**不要把这个目录提交到 Git**，在 `.gitignore` 里加上：

```text
.venv/
```

## 激活与退出

激活后，`python`、`pip` 命令都会指向虚拟环境里的那一份。

Windows PowerShell：

```bash
.venv\Scripts\Activate.ps1
```

Windows CMD：

```bash
.venv\Scripts\activate.bat
```

macOS / Linux：

```bash
source .venv/bin/activate
```

激活成功后，命令行提示符前会出现 `(.venv)`。退出用：

```bash
deactivate
```

PowerShell 若报「禁止运行脚本」，说明执行策略限制了脚本运行，可只对当前窗口放开：

```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

## pip 常用命令

```bash
pip install requests             # 安装
pip install requests==2.31.0     # 安装指定版本
pip install -r requirements.txt  # 按文件批量安装
pip install -U requests          # 升级
pip uninstall requests           # 卸载
pip list                         # 列出已安装的包
pip show requests                # 查看某个包的详情
pip freeze                       # 输出当前环境的包及版本
```

如果 `pip` 命令找不到，用 `python -m pip` 代替更稳妥，能确保装进当前 Python 环境。

## requirements.txt

把项目依赖写进 `requirements.txt`，方便别人一键还原环境：

```bash
pip freeze > requirements.txt
pip install -r requirements.txt
```

文件内容形如：

```text
requests==2.31.0
urllib3==2.1.0
```

## 国内镜像源

默认源在国外，安装慢时可以临时指定镜像：

```bash
pip install requests -i https://pypi.tuna.tsinghua.edu.cn/simple
```

也可以永久配置：

```bash
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

常用镜像：

| 源 | 地址 |
|----|------|
| 清华 | `https://pypi.tuna.tsinghua.edu.cn/simple` |
| 阿里云 | `https://mirrors.aliyun.com/pypi/simple` |

## 其他工具

| 工具 | 说明 |
|------|------|
| `venv` | 标准库自带，无需安装，够用 |
| `virtualenv` | 第三方，创建更快，兼容更老的 Python |
| `conda` / `miniconda` | 面向数据科学，可同时管理 Python 版本和非 Python 依赖 |
| `poetry` / `uv` | 现代依赖管理工具，自带锁文件 |

`pip` + `requirements.txt` 只有 `pip freeze` 记录的当前状态，没有真正的锁文件语义；需要精确复现依赖树时可以考虑 poetry 或 uv。
