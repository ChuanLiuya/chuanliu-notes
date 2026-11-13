# BoxCollider2D（盒碰撞体）

碰撞体负责定义物体的物理外形，`BoxCollider2D` 就是最简单的矩形。它自己不产生运动，只是告诉物理系统「这个物体占多大一块地方」。

::: tip 提示
本文只是个人学习笔记，更权威的内容建议查看[Unity 官方文档](https://docs.unity3d.com/cn/current/Manual/class-BoxCollider2D.html)
:::

## 属性

| 属性 | 说明 |
| --- | --- |
| Edit Collider | 进入编辑模式，拖动四条边上的手柄改形状 |
| Offset | 矩形中心相对物体的偏移 |
| Size | 矩形的宽高，单位是世界单位 |
| Edge Radius | 四个角的圆角半径，让角不那么尖 |
| Material | `Physics Material 2D`，控制摩擦和弹性 |
| Is Trigger | 勾上后不产生物理阻挡，只发触发事件 |
| Used By Effector | 是否接收 `Effector2D` 的效果，比如平台穿透 |
| Auto Tiling | `SpriteRenderer` 尺寸变化时自动重建碰撞体 |

## 和刚体的关系

挂在同一个物体、或它子物体上的 `Collider2D`，都会自动归属到那个 `Rigidbody2D`，跟着一起移动。同一刚体下的碰撞体之间不会互相碰撞，所以可以摆一堆盒子拼出一个不规则外形。

::: warning 警告
碰撞体不会自动跟着 Sprite 图片的大小走。换了 sprite，或者改了 `SpriteRenderer.size`，都要手动调 `Size`，或者勾上 `Auto Tiling`。
:::

## 静态碰撞体

只有碰撞体、没有刚体，就是静态碰撞体，位置不应该再变，适合地面和墙。碰撞事件需要至少一方带 `Rigidbody2D` 才会产生，两个静态碰撞体之间不会有任何回调。

## 代码示例

```csharp
using UnityEngine;

public class GroundCheck : MonoBehaviour
{
    private BoxCollider2D box;

    void Awake()
    {
        box = GetComponent<BoxCollider2D>();

        // 代码里改尺寸会立即生效，Scene 视图里能直接看到
        box.size = new Vector2(2f, 0.5f);
        box.offset = new Vector2(0f, -1f);
    }

    // 仅在勾选了 Is Trigger 时触发
    void OnTriggerEnter2D(Collider2D other)
    {
        if (other.CompareTag("Player"))
        {
            Debug.Log("玩家进入区域");
        }
    }

    // 没勾 Is Trigger 时触发
    void OnCollisionEnter2D(Collision2D collision)
    {
        Debug.Log($"和 {collision.gameObject.name} 撞上了");
    }
}
```

## Is Trigger 的区别

| | 勾选 Is Trigger | 不勾 Is Trigger |
| --- | --- | --- |
| 物理阻挡 | 没有，会穿过去 | 有，会被挡住 |
| 回调 | `OnTriggerEnter2D` / `Stay` / `Exit` | `OnCollisionEnter2D` / `Stay` / `Exit` |
| 回调参数 | `Collider2D` | `Collision2D`，含接触点和相对速度 |

## 摩擦与弹性

`Physics Material 2D` 上有两个值：

- `Friction` 摩擦，0 就是冰面
- `Bounciness` 弹性，1 是完全弹性碰撞

把它拖到 `Material` 槽位即可，同一份材质可以被多个碰撞体共用。

::: tip 提示
想让某两个层之间完全不产生碰撞，可以在 `Project Settings → Physics 2D → Layer Collision Matrix` 里取消勾选，比在代码里判断要高效。
:::
