# Unity 是什么？

Unity 是一个跨平台的游戏引擎，用来开发 2D/3D 游戏、实时三维交互内容和仿真应用。它把渲染、物理、动画、音频、资源管理这些底层能力封装好，开发者只需要专注于游戏逻辑本身。

::: tip 提示
本文只是个人学习笔记，更权威的内容建议查看[Unity 官方文档](https://docs.unity3d.com/cn/current/Manual/index.html)
:::

## 核心概念

| 概念 | 说明 |
| --- | --- |
| Scene（场景） | 一个关卡或一个画面，是游戏的运行单位 |
| GameObject（游戏对象） | 场景里的一切物体，本身只是一个容器 |
| Component（组件） | 挂载在 GameObject 上，决定它的行为和外观 |
| Prefab（预制体） | 可复用的物体模板，改一处影响所有实例 |
| Asset（资源） | 模型、贴图、音频、脚本等素材文件 |

一句话概括 Unity 的思维方式：**组合优于继承**。你很少去写一个庞大的类，而是把一个空 GameObject 和若干组件拼起来。

## 编辑器主要面板

- **Hierarchy（层级）**：当前场景里所有 GameObject 的树状列表
- **Scene / Game**：分别是编辑视角和摄像头实际看到的画面
- **Inspector（属性）**：查看和修改选中对象的组件参数
- **Project（工程）**：项目的资源目录，对应磁盘上的 `Assets` 文件夹
- **Console（控制台）**：输出日志、警告和报错

## 生命周期

挂载脚本必须继承 `MonoBehaviour`，Unity 会在固定时机回调这些方法：

```csharp
using UnityEngine;

public class Player : MonoBehaviour
{
    // 对象创建时调用一次，常用于初始化
    void Awake() { }

    // 每帧调用，帧率相关，放输入检测和动画
    void Update() { }

    // 固定时间间隔调用，默认 0.02s，放物理相关逻辑
    void FixedUpdate() { }

    // 对象销毁时调用，用于释放资源
    void OnDestroy() { }
}
```

## 适合做什么

- 2D / 3D 游戏，尤其是独立游戏和小体量商业项目
- VR / AR 交互应用
- 建筑可视化、数字孪生等实时三维场景
- 快速做玩法原型，验证想法

## 不太适合的场景

- 追求极致画质的 3A 大作（通常用 Unreal）
- 纯服务器逻辑（Unity 的优势在客户端表现）
- 简单的 2D 像素游戏（有更轻量的引擎可选）
