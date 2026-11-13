# Git 基础操作

Git 常用命令速查，覆盖日常开发中绝大多数场景。

## 创建仓库

### git init

初始化一个 Git 仓库。执行后会在当前目录生成 `.git` 文件夹，包含所有版本控制数据。

```bash
git init
```

### git clone

从远程仓库克隆一份完整的代码到本地。

```bash
git clone <仓库地址>

# 克隆到指定目录
git clone <仓库地址> <目录名>

# 只克隆最近一次提交（节省时间）
git clone --depth=1 <仓库地址>
```

## 提交与修改

### git status

查看当前工作区和暂存区的状态，告诉你哪些文件被修改了、哪些还没被追踪。

```bash
git status

# 简洁模式
git status -s
```

### git add

将工作区的改动加入暂存区，准备提交。

```bash
# 添加指定文件
git add <文件名>

# 添加所有改动
git add .

# 交互式添加（逐个确认）
git add -p
```

### git commit

将暂存区的内容提交到本地仓库，生成一个快照。

```bash
# 提交并附带说明
git commit -m "feat: 添加登录功能"

# 跳过暂存区，直接提交所有已跟踪文件的改动
git commit -am "fix: 修复样式问题"

# 修改上一次提交（未 push 时）
git commit --amend -m "新的提交信息"
```

### git diff

查看文件的具体改动内容。

```bash
# 查看工作区相对于暂存区的差异
git diff

# 查看暂存区相对于最新 commit 的差异
git diff --staged

# 查看两个分支的差异
git diff <分支A> <分支B>
```

### git rm / git mv

删除或移动 Git 追踪的文件。

```bash
# 删除文件（同时从工作区和暂存区删除）
git rm <文件名>

# 只从暂存区移除，保留工作区文件
git rm --cached <文件名>

# 重命名/移动文件
git mv <旧名> <新名>
```

## 分支操作

### git branch

管理分支的创建、查看、删除。

```bash
# 查看本地分支
git branch

# 查看所有分支（含远程）
git branch -a

# 创建分支
git branch <分支名>

# 删除分支
git branch -d <分支名>

# 强制删除（未合并的分支）
git branch -D <分支名>

# 重命名分支
git branch -m <旧名> <新名>
```

### git checkout / git switch

切换分支或恢复文件。

```bash
# 切换分支
git checkout <分支名>
git switch <分支名>

# 创建并切换到新分支
git checkout -b <分支名>
git switch -c <分支名>

# 恢复工作区的文件（丢弃修改）
git checkout -- <文件名>
git restore <文件名>
```

### git merge

将指定分支的改动合并到当前分支。

```bash
# 合并分支
git merge <分支名>

# 合并时禁止快进（保留分支痕迹）
git merge --no-ff <分支名>

# 终止有冲突的合并
git merge --abort
```

### git rebase

将当前分支的提交"搬家"到目标分支的最新提交之后，使历史更线性。

```bash
# 变基到目标分支
git rebase <目标分支>

# 交互式变基（合并、修改历史提交）
git rebase -i HEAD~3

# 终止变基
git rebase --abort
```

::: warning 注意
`rebase` 会改写提交历史，不要在公共分支上使用。
:::

## 远程操作

### git remote

管理远程仓库的连接。

```bash
# 查看远程仓库列表
git remote -v

# 添加远程仓库
git remote add origin <仓库地址>

# 修改远程仓库地址
git remote set-url origin <新地址>

# 删除远程仓库
git remote remove origin
```

### git push

将本地提交推送到远程仓库。

```bash
# 推送到远程分支
git push origin <分支名>

# 首次推送并建立追踪关系
git push -u origin <分支名>

# 推送所有标签
git push --tags

# 强制推送（危险，会覆盖远程历史）
git push --force
```

### git pull / git fetch

从远程仓库拉取更新。

```bash
# 拉取并自动合并（fetch + merge）
git pull

# 拉取并变基（fetch + rebase）
git pull --rebase

# 只拉取不合并（仅更新远程追踪分支）
git fetch

# 拉取所有远程分支
git fetch --all
```

### 关联远程分支

```bash
# 查看本地分支与远程的关联
git branch -vv

# 手动建立关联
git branch --set-upstream-to=origin/<远程分支> <本地分支>
```

## 查看历史

### git log

查看提交历史。

```bash
# 查看完整历史
git log

# 单行紧凑模式
git log --oneline

# 带分支图
git log --oneline --graph --all

# 按作者筛选
git log --author="用户名"

# 查看某个文件的修改历史
git log -- <文件名>
```

### git show

查看某次提交的详细信息。

```bash
# 查看最近一次提交
git show

# 查看指定 commit
git show <commit-hash>

# 查看某个 tag 的详情
git show <tag名>
```

### git blame

查看文件中每一行是谁、在什么时候修改的。

```bash
git blame <文件名>

# 只看指定行范围
git blame -L 10,20 <文件名>
```

## 撤销操作

### git reset

回退到指定版本。

```bash
# 撤销暂存区，保留工作区修改（默认）
git reset HEAD <文件名>

# 回退到上一个 commit，保留工作区和暂存区
git reset --soft HEAD~1

# 回退到上一个 commit，保留工作区、清空暂存区
git reset --mixed HEAD~1

# 回退到上一个 commit，丢弃所有修改
git reset --hard HEAD~1
```

### git revert

创建一个新的 commit 来撤销指定 commit 的改动，不会修改历史。

```bash
# 撤销某次提交（生成反向 commit）
git revert <commit-hash>

# 撤销多个连续提交
git revert <旧hash>..<新hash>
```

### git restore

恢复文件到指定状态（Git 2.23+ 推荐使用）。

```bash
# 丢弃工作区的修改
git restore <文件名>

# 将暂存区的文件撤回工作区
git restore --staged <文件名>

# 恢复文件到某个 commit 的状态
git restore --source=<commit-hash> <文件名>
```

## 标签管理

```bash
# 查看所有标签
git tag

# 创建轻量标签
git tag <标签名>

# 创建附注标签（含说明信息）
git tag -a <标签名> -m "说明信息"

# 给历史 commit 打标签
git tag <标签名> <commit-hash>

# 推送标签到远程
git push origin <标签名>
git push --tags

# 删除本地标签
git tag -d <标签名>

# 删除远程标签
git push origin --delete <标签名>
```

## 储藏管理

当需要临时切换分支但不想提交时，将当前改动暂存起来。

```bash
# 储藏所有改动
git stash

# 储藏时添加说明
git stash push -m "正在开发的功能"

# 查看储藏列表
git stash list

# 恢复最近一次储藏（不删除记录）
git stash apply

# 恢复最近一次储藏并删除记录
git stash pop

# 应用指定储藏
git stash apply stash@{0}

# 删除指定储藏
git stash drop stash@{0}

# 清空所有储藏
git stash clear
```
 