# git快速上手

## 安装git

从[网上](https://git-scm.com/install/)下。

下载好了之后，打开cmd，输入
``` bash
git --version
# git -v  简写
```
会弹出类似如下代码，证明你已经下载好了。
```
git version 2.43.0.windows.1
```

## git配置

在终端里敲这两条，确保名字和邮箱和 GitHub 账号一致（注意：邮箱必须是 GitHub 账号里 Verified（已验证） 的邮箱，否则头像不亮）：

```bash
git config --global user.name "ChuanLiuya"  # 填你的 GitHub 用户名
git config --global user.email "你的绑定邮箱@example.com"  # 必须填 GitHub 绑定的那个
```

然后去github官网生成令牌（就是 密码 的意思）：
- 登录github，点击settings设置
- 左下角找到developer settings开发者设置 => personal access tokens个人访问令牌 => tokens(classic) => generate new token(classic)
- 随便取一个名字，勾选repo(完全控制私有仓库)。
- 然后点生成，复制那个令牌。关了网页就看不到了。

## 创建库
选择一个目录，然后初始化一个库：
``` bash
git init

```
初始化后，会多一个.git目录。

此时，可以随便弄点写点什么东西。

写完之后想要保存，就：
``` bash
git add .
git commit -m "我修改了xxx"
```

然后就保存成功了。