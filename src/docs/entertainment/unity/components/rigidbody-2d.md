# Rigidbody2D（刚体）

`Transform` 组件决定物体的位置和旋转，但物理引擎也需要移动碰撞体，于是需要一个组件把物理系统的位移结果同步回 `Transform`，这就是 `Rigidbody2D`。它会接管 `Transform`，用自己算出来的位置和旋转去覆盖它。

::: tip 提示
本文只是个人学习笔记，更权威的内容建议查看[Unity 官方文档](https://docs.unity3d.com/cn/current/Manual/class-Rigidbody2D.html)
:::

两个最基础的点：

- 加了 `Rigidbody2D` 之后，不要再直接改 `transform.position` 来移动物体，会和物理系统打架，表现为抖动、穿模
- 同一个 `Rigidbody2D` 上的多个碰撞体之间**不会**互相碰撞，它们合起来相当于一个复合碰撞体

## Body Type（刚体类型）

| 类型 | 受重力和力 | 会被别人撞动 | 典型用途 |
| --- | --- | --- | --- |
| Dynamic | 是 | 是 | 玩家、箱子、掉落物 |
| Kinematic | 否 | 否，但能撞开别人 | 移动平台、会动的障碍 |
| Static | 否 | 否 | 地面、墙 |

`Kinematic` 不受重力也不被力推动，需要用 `MovePosition`、`MoveRotation` 或者直接赋值 `linearVelocity` 来移动它。

## 常用属性

| 属性 | 说明 |
| --- | --- |
| Mass | 质量，影响碰撞时的动量交换 |
| Use Auto Mass | 用碰撞体的密度自动算出质量 |
| Linear Damping | 线性阻尼，越大减速越快 |
| Angular Damping | 角阻尼，越大转速衰减越快 |
| Gravity Scale | 重力倍率，设为 0 就是不受重力 |
| Constraints | 冻结某个轴，比如 `Freeze Rotation Z` |
| Collision Detection | `Discrete` 省性能，`Continuous` 防高速穿透 |
| Interpolate | 在物理帧之间插值，让运动看起来更平滑 |
| Sleeping Mode | 静止后进入休眠，省性能 |

::: warning 警告
Unity 6 把 `velocity` 改名为 `linearVelocity`，`drag` 改名 `linearDamping`，`angularDrag` 改名 `angularDamping`。旧名字还能用，但已被标记为过时，新代码建议直接用新名字。
:::

## 代码示例

```csharp
using UnityEngine;

public class PlayerMove : MonoBehaviour
{
    private Rigidbody2D rb;
    public float speed = 5f;

    void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
    }

    void FixedUpdate()
    {
        // 物理相关的位移都放在 FixedUpdate 里
        float h = Input.GetAxisRaw("Horizontal");

        // 保留 y 方向的速度，只改水平方向，否则会「抹掉」重力积累的下落速度
        rb.linearVelocity = new Vector2(h * speed, rb.linearVelocity.y);
    }

    // 跳跃：施加瞬时冲量
    public void Jump(float force)
    {
        rb.AddForce(Vector2.up * force, ForceMode2D.Impulse);
    }
}
```

`ForceMode2D` 的四种模式：

| 模式 | 含义 |
| --- | --- |
| `Force` | 默认，持续施力，受质量影响 |
| `Impulse` | 瞬时冲量，受质量影响，适合跳跃、击退 |
| `VelocityChange` | 直接改速度，不受质量影响 |
| `Acceleration` | 持续加速，不受质量影响 |

## 三种移动方式

| 方式 | 写法 | 特点 |
| --- | --- | --- |
| 直接赋速度 | `rb.linearVelocity = v` | 响应快、可控，但会覆盖之前施加的力 |
| 施力 | `rb.AddForce(v * f)` | 有惯性，手感偏软 |
| 硬移动 | `rb.MovePosition(p)` | 不受挤压影响，适合 `Kinematic` |

## 踩坑记录

- 在 `Update` 里改 `transform.position`，同时挂着刚体，物体就会抖动甚至穿墙，应该改用刚体的 API
- 高速物体穿过薄墙，把 `Collision Detection` 改成 `Continuous`
- 物理代码写在 `Update` 里，行为会随帧率变化，应该放在 `FixedUpdate`
- 不想让物体被撞得乱转，执行 `rb.constraints = RigidbodyConstraints2D.FreezeRotation;`
- 刚体默认会休眠，用 `rb.WakeUp()` 唤醒，或用 `rb.IsSleeping()` 判断状态
