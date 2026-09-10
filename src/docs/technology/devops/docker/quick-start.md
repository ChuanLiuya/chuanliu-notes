# Docker快速上手

这个文档将教会你如何使用docker启动容器。

## 安装Docker

从[官网](https://www.docker.com/products/docker-desktop/)下载 Docker Desktop 并安装。

安装完成后，打开终端输入：

```bash
docker --version
```

能显示版本号就说明安装成功了。

## 下载镜像

使用 `docker pull` 来下载镜像：

```bash
docker pull nginx
```

下载完毕后，通过 `docker images` 命令来查看已安装的镜像。

::: tip
若您在国内大陆，可能会因为网络问题报错。可以通过设置镜像站来解决问题。

:::

## 创建容器，运行容器

使用 `docker run` 来创建并运行容器：

```bash
docker run -p 80:80 nginx
```

然后通过访问 `http://localhost:80` 查看刚刚启动的nignx。

## 附录

### 镜像名的四个部分

完整的下载命令为：

```bash
docker pull docker.io/library/nginx:latest
```

可以看到一个镜像名分为四个部分：

- **docker.io**: 这部分是registry，仓库地址，docker.io表示是docker hub的官方仓库，若为官方仓库可省略。
- **library**: library是命名空间，也就是作者名字。若是官方的名字，可省略。
- **nginx**: 镜像名。
- **latest**: 版本号，标签。可以是`:latest`,`:1.28.0`，若省略则默认拉取最新的镜像。

所以简化后为：

```bash
docker pull nginx
```

### 创建容器和运行容器的补充说明

> 也可以写 `docker run 8541484afbc9`，后面跟镜像的 id。

::: tip
run 的时候若不给他分配名字，他会自己随机取一个名字。

:::

`-d` 启动命令:

运行了之后，cmd 会被锁定。此时新开一个 cmd。运行 `docker ps`，也就是 process status 的缩写，意思是进程状态。运行这个命令可以查看当前的进程状态、容器运行情况。

如何不进行锁定呢？把之前那个停掉，我们通常再在后面加上 `-d`，表示 detached mode，分离模式。

`-p` 启动命令:

每个 docker 容器都运行在一个独立的虚拟环境里。容器内的网络和宿主机是隔离的。默认情况下，宿主机无法访问到 docker 的内部网络。把容器内的端口与宿主机的端口进行绑定，冒号前是宿主机的端口，冒号后面是容器内的端口。
