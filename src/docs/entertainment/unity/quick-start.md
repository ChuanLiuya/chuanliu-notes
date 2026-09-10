# Unity 快速上手

这篇记录从安装到跑起第一个场景的最短路径。

## 安装

1. 下载 **Unity Hub**（官方管理器），后续版本和模块都通过它装
2. 在 Hub 的 `Installs` 里点 `Install Editor`，选一个 LTS 版本
3. 勾选需要的模块：`Microsoft Visual Studio` 用于写 C#，`Android Build Support` 等按目标平台选

::: warning 警告
不要同时装太多版本，磁盘占用很大。日常只需要保留一个 LTS 即可。
:::

## 创建项目

在 Hub 的 `Projects` 里点 `New project`，选择一个模板：

| 模板 | 用途 |
| --- | --- |
| 2D (Built-in) | 2D 游戏，摄像机是正交投影 |
| 3D (Built-in) | 3D 游戏，最通用的起点 |
| URP | 通用渲染管线，画质与性能平衡更好 |
| HDRP | 高清晰渲染管线，面向高端画质 |

学习阶段直接选 `3D (Built-in)` 或 `2D (Built-in)` 就够了。

## 第一个脚本

在 `Project` 面板右键 → `Create` → `C# Script`，命名 `HelloUnity`（**文件名必须和类名一致**）：

```csharp
using UnityEngine;

public class HelloUnity : MonoBehaviour
{
    void Start()
    {
        // 输出到 Console 面板
        Debug.Log("Hello Unity!");
    }
}
```

把脚本拖到 Hierarchy 里的任意 GameObject 上，点击顶部的 ▶ 运行，就能在 Console 看到输出。

## 常用快捷键

| 快捷键 | 作用 |
| --- | --- |
| `Q` / `W` / `E` / `R` | 切换 手 / 移动 / 旋转 / 缩放 工具 |
| `F` | 聚焦到选中的对象 |
| `Ctrl + P` | 播放 / 停止 |
| `Ctrl + Shift + P` | 暂停 |
| `Ctrl + D` | 复制选中对象 |

## 下一步

- 熟悉 [Unity 是什么](/entertainment/unity/what-is-unity) 里的 GameObject 与组件模型
- 学会用 Prefab 复用物体，避免重复劳动
- 了解 `Rigidbody` + `Collider` 做物理，`Animator` 做动画
