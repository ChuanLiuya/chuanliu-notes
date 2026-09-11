# PolygonCollider2D（多边形碰撞体）

`PolygonCollider2D` 用任意多边形轮廓来描述碰撞外形，适合形状不规则的 sprite，比如角色、道具、地形碎块。代价是顶点越多，物理计算越贵。

::: tip 提示
本文只是个人学习笔记，更权威的内容建议查看[Unity 官方文档](https://docs.unity3d.com/cn/current/Manual/class-PolygonCollider2D.html)
:::

## 轮廓从哪来

1. **自动生成**：给物体添加 `PolygonCollider2D` 时，Unity 会按 sprite 的透明边界自动算出一圈顶点
2. **Sprite Editor**：在 `Sprite Editor` 里自定义 `Physics Shape`，生成的结果会持久化到 sprite 资源上
3. **手动编辑**：点组件的 `Edit Collider`，拖动顶点微调

::: tip 提示
自动生成的轮廓精度由图片的透明边缘决定，边缘有杂色时可能出现一堆无用顶点，建议在 Sprite Editor 里重新生成后手动精简。
:::

## 属性

| 属性 | 说明 |
| --- | --- |
| Offset | 整体偏移 |
| Points | 顶点数组，支持多条路径（`pathCount`），每条路径是一个闭合多边形 |
| Edge Radius | 顶点的圆角半径 |
| Auto Tiling | `SpriteRenderer` 尺寸变化时自动重建轮廓 |
| Material | `Physics Material 2D`，控制摩擦和弹性 |
| Is Trigger | 同其他碰撞体，不阻挡只触发 |
| Used By Effector | 是否接收 `Effector2D` 的效果 |

## 代码示例

运行时用顶点数组画轮廓：

```csharp
using UnityEngine;

public class StarCollider : MonoBehaviour
{
    private PolygonCollider2D poly;

    void Awake()
    {
        poly = GetComponent<PolygonCollider2D>();

        // pathCount 是路径数量，每条路径独立成一个闭合多边形
        poly.pathCount = 1;

        // 顶点是物体本地坐标，按顺序连成一条不自交的闭合轮廓即可
        poly.SetPath(0, new[]
        {
            new Vector2(0f, 1f),
            new Vector2(0.3f, 0.3f),
            new Vector2(1f, 0.3f),
            new Vector2(0.5f, -0.2f),
            new Vector2(0.7f, -1f),
            new Vector2(0f, -0.5f),
            new Vector2(-0.7f, -1f),
            new Vector2(-0.5f, -0.2f),
            new Vector2(-1f, 0.3f),
            new Vector2(-0.3f, 0.3f),
        });
    }

    // 读取当前轮廓
    void LogPoints()
    {
        Vector2[] path = poly.GetPath(0);
        Debug.Log($"顶点数量：{path.Length}");
    }
}
```

## 性能建议

| 场景 | 建议 |
| --- | --- |
| 方方正正的箱子 | 用 `BoxCollider2D`，不要用多边形 |
| 圆形、球 | 用 `CircleCollider2D` |
| 形状复杂但有凸块 | 拆成几个 `BoxCollider2D` / `CircleCollider2D` 更省 |
| 静态地形 | 用 `EdgeCollider2D` 或 `CompositeCollider2D` |
| 顶点特别多 | 精简轮廓，物理不需要和美术一样精细 |

多个凸多边形拼起来，通常比一个带凹角的复杂多边形更便宜，因为物理引擎内部处理凸形状更高效。

## 常见问题

- 报错 `polygon must not be self-intersecting`，说明顶点顺序连成了自交的轮廓，需要删点或重新排序
- 和 Tilemap 配合时，`TilemapCollider2D` 会为每个瓦片生成碰撞体，数量爆炸，记得加 `CompositeCollider2D` 合并
- 轮廓和图片对不上，检查 `Offset` 和物体的缩放，缩放为负数时轮廓会翻转
- 用 `Is Trigger` 做拾取时，别忘记给区域加 `Rigidbody2D`（`Kinematic` 即可），否则不会有回调
