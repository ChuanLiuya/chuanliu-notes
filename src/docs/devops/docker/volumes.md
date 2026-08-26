# Docker挂载卷

容器内的数据默认存储在容器内部，一旦容器被删除，数据就会丢失。挂载卷可以让你把数据持久化到宿主机上。

## 为什么需要挂载卷



## 挂载卷作用

之前学过 `-p` 参数是把宿主机与容器的端口进行绑定，`-v` 则是吧宿主机与容器的文件目录进行绑定。容器内对这个文件夹的修改会影响宿主机的文件夹，在宿主机对文件夹的修改同样会影响容器内的文件夹。这种目录被称为挂载卷。

容器是临时性的，删除或重建容器后，里面的数据会全部消失。比如你在容器里存了数据库文件，容器一删，数据就没了。 
挂载卷可以把宿主机的目录和容器内的目录关联起来，容器内写入的数据会同步保存到宿主机上，容器删了数据也还在。

如果我们使用挂载卷，，容器内对应目录的数据就会保存在宿主机对应的目录里面。
## 两种挂载方式

### 绑定挂载

把宿主机上已有的目录挂载到容器内。

``` bash
docker run -v /宿主机路径:/容器内路径 nginx
```

例如把当前目录挂载到 nginx 的网页目录：

``` bash
docker run -v $(pwd):/usr/share/nginx/html nginx
```

::: tip
`pwd` 是 print working directory 的缩写，作用是显示当前所在的目录路径。`$(pwd)` 会先执行 `pwd` 命令，再把输出（当前目录的绝对路径）填到这个位置，因此这条命令等价于把当前目录挂载进容器。

:::

这样修改宿主机上的文件，容器内会立即生效，非常适合开发时调试。

### 命名卷挂载

让docker自动创建一个存储空间，我们为这个存储空间起一个名字。然后挂载时直接使用名字。


#### 命名卷挂载实战

首先创建一个存储空间为其命名

``` bash
docker volume create my_web
```

然后挂载到nginx上。

``` bash
docker run -d -p 80:80 -v my_web:/usr/share/nginx/html nginx
```
`docker volume inspect`命令可以看这个存储空间具体在宿主机的哪里

查看自己的命名卷的位置：

``` bash
docker volume inspect my_web
```
::: tip
命名卷有一个特别的功能，命名卷在第一次使用的时候，docker会把容器内的文件夹同步到命名卷里面进行初始化。

绑定挂载没有这个功能。
:::

查看自己所有的命名卷：
``` bash
docker volume list

```

删除命名卷
``` bash
docker volume rm
```


## 参考文献

- [Docker 官方文档 - Volumes](https://docs.docker.com/storage/volumes/)
- [Docker 官方文档 - Bind mounts](https://docs.docker.com/storage/bind-mounts/)
