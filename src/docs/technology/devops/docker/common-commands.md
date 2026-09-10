# Docker常用命令

整理一些日常使用频率较高的 docker 命令，方便快速查阅。

## 镜像相关

| 命令 | 描述 | 例子 |
| --- | --- | --- |
| `docker pull` | 获取一个镜像 | `docker pull nginx` |
| `docker images` | 列出本地主机上的镜像 | `docker images` |
| `docker rmi` | 删除镜像 | `docker rmi nginx` |

## 容器相关

| 命令 | 描述 | 例子 |
| --- | --- | --- |
| [`docker run`](#docker-run-params) | 创建并运行容器 | `docker run nginx` |
| [`docker ps`](#docker-ps-params) | 查看容器的进程状态 | `docker ps` |
| `docker stop` | 停止容器 | `docker stop <容器名或容器id>` |
| `docker start` | 启动已停止的容器 | `docker start <容器名或容器id>` |
| `docker restart` | 重启容器 | `docker restart <容器名或容器id>` |
| `docker rm` | 删除容器 | `docker rm <容器名或容器id>` |
| [`docker exec`](#docker-exec-params) | 进入容器 | `docker exec -it <容器名或容器id> bash` |
| [`docker logs`](#docker-logs-params) | 查看容器日志 | `docker logs <容器名或容器id>` |

## 其他

| 命令 | 描述 | 例子 |
| --- | --- | --- |
| `docker --version` | 查看版本号 | `docker --version` |
| `docker info` | 查看 docker 环境信息 | `docker info` |
| `docker system prune` | 清理未使用的资源 | `docker system prune` |

## 参数详解

### `docker run` 参数 {#docker-run-params}

| 参数 | 说明 |
| --- | --- |
| `-d` | 后台运行，不会锁定 cmd |
| `-p 宿主机端口:容器端口` | 端口绑定 |
| `--name <名字>` | 指定容器名字 |
| `-it` | 进入交互式终端 |

### `docker ps` 参数 {#docker-ps-params}

| 参数 | 说明 |
| --- | --- |
| `-a` | 查看所有容器（包括已停止的） |

### `docker exec` 参数 {#docker-exec-params}

| 参数 | 说明 |
| --- | --- |
| `-it` | 进入交互式终端 |

### `docker logs` 参数 {#docker-logs-params}

| 参数 | 说明 |
| --- | --- |
| `-f` | 实时跟踪日志 |

## 参考文献

- [Docker 官方文档](https://docs.docker.com/)