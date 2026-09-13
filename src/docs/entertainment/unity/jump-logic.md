# 跳跃逻辑

跳跃看起来只是「按一下空格往上飞」，但要做得好用，得解决三件事：**怎么给向上的速度**、**怎么判断能不能跳**、**怎么调手感**。下面按这个顺序讲。

::: tip 提示
本文只是个人学习笔记，更权威的内容建议查看[Unity 官方文档](https://docs.unity3d.com/cn/current/Manual/class-Rigidbody2D.html)和[Rigidbody2D API](https://docs.unity3d.com/cn/current/ScriptReference/Rigidbody2D.html)
:::

## 最简实现：给竖直速度

2D 平台跳跃里，跳跃就是**把 `Rigidbody2D` 的竖直速度设成一个正值**：

```csharp
if (Input.GetKeyDown(KeyCode.Space))
{
    rb.linearVelocityY = jumpForce;
}
```

几个关键选择：

| 写法 | 原因 |
| --- | --- |
| `GetKeyDown` 而不是 `GetKey` | `GetKey` 在按住期间每帧都是 `true`，会连续触发；`GetKeyDown` 只在按下那一帧为 `true` |
| 直接赋值 `linearVelocityY`，而不是 `AddForce` | `AddForce` 的结果受质量、力模式（`Force` / `Impulse` / `VelocityChange`）影响，同样一个力在不同物体上手感不同；赋值得到的是确定的高度 |
| 只改 Y 分量 | 写 `rb.linearVelocity = Vector2.up * jumpForce` 会把水平速度清零，跑跳时出现「急停」的怪异手感 |
| 不要用 `transform.position` 往上抬 | `Rigidbody2D` 接管了 `Transform`，手动改位置会和物理系统打架，表现为抖动、穿模 |

至于为什么是赋值速度而不是别的，可以对照[Rigidbody2D 刚体](/entertainment/unity/components/rigidbody-2d)里 `Kinematic` 的移动方式一起看。

## 判断能不能跳：地面检测

只写上面那三行，玩家在空中也能一直跳。所以必须先知道「脚下有没有地」。

### 射线检测

从角色往正下方发一条射线，打中地面层就算站在地上：

```csharp
[SerializeField] private float groundCheckDistance = 1.5f;
[SerializeField] private bool isOnTheGround;
private LayerMask groundLayer;

void Awake()
{
    // 拿到项目里名为 Ground 的层
    groundLayer = LayerMask.GetMask("Ground");
}

void Update()
{
    isOnTheGround = Physics2D.Raycast(
        transform.position,   // 起点：角色中心
        Vector2.down,         // 方向：正下方
        groundCheckDistance,  // 长度
        groundLayer           // 只检测 Ground 层
    );
}
```

`Physics2D.Raycast` 返回的是 `RaycastHit2D`，它有个隐式转换能直接当 `bool` 用：打中了是 `true`，没打中是 `false`，所以可以把它直接赋给 `bool` 变量。想拿命中信息（命中点、法线、对方碰撞体）时可以显式声明成 `RaycastHit2D hit`。

::: warning 警告
`LayerMask` 必须只包含地面层。传 `0` 会让射线检测所有层，包括角色自己的碰撞体，结果就是「站在空中也显示在地面上」，跳跃变成无限跳。反过来，如果 `LayerMask.GetMask("Ground")` 返回 `0`，通常说明项目里根本没有叫 `Ground` 的层，或者名字拼错了。
:::

三个容易踩的参数问题：

| 参数 | 坑 |
| --- | --- |
| 起点 | `transform.position` 是角色**中心**，不是脚底，检测长度必须大于半个碰撞体高度才能穿到地面 |
| 长度 | 太短 → 检测不到地面，跳不起来；太长 → 离地老远还认为「在地面上」 |
| 层 | 漏设 → 命中自己；多设 → 还没落地就算落地 |

长度建议用 Gizmos 画出来，边跑边调：

```csharp
private void OnDrawGizmos()
{
    // 红色线段就是这条射线的实际检测范围
    Gizmos.color = Color.red;
    Gizmos.DrawLine(transform.position, transform.position + Vector3.down * groundCheckDistance);
}
```

### 圆形检测

一条线只能碰到正下方很窄的一段，站在两个平台的交界处会时灵时不灵。更稳的做法是在脚底放一个空物体当检测点，用圆形检测：

```csharp
[SerializeField] private Transform groundCheckPoint; // 挂在角色脚底的空物体
[SerializeField] private float groundCheckRadius = 0.2f;

// 用 OverlapCircle 替代 Raycast
isOnTheGround = Physics2D.OverlapCircle(
    groundCheckPoint.position,
    groundCheckRadius,
    groundLayer
);
```

同样用 Gizmos 可视化，记得加 `OnDrawGizmosSelected` 避免选中时为空：

```csharp
private void OnDrawGizmosSelected()
{
    if (groundCheckPoint == null) return;
    Gizmos.color = Color.red;
    Gizmos.DrawWireSphere(groundCheckPoint.position, groundCheckRadius);
}
```

圆形容错更好，代价是多维护一个子物体。

## 把物理操作放进 FixedUpdate

`Update` 跟渲染帧走，`FixedUpdate` 跟物理帧走（默认每秒 50 次）。给速度是物理操作，放 `FixedUpdate` 更稳。

但 `Input.GetKeyDown` 在 `FixedUpdate` 里读会**漏帧**：如果某一帧渲染时间很长，这一帧里可能跑了好几次 `FixedUpdate`，第二次以后读到的都是 `false`，玩家的按键就被吞掉了。所以标准做法是——**在 `Update` 里记录输入，在 `FixedUpdate` 里消费**：

```csharp
private bool jumpPressed;

void Update()
{
    if (Input.GetKeyDown(KeyCode.Space))
    {
        jumpPressed = true;
    }
}

void FixedUpdate()
{
    if (jumpPressed && isOnTheGround)
    {
        rb.linearVelocityY = jumpForce;
    }

    // 不管有没有跳成功，这一帧的输入都用掉了
    jumpPressed = false;
}
```

这样既不会漏帧，物理操作也落在正确的帧里。

## 手感优化

能跳起来只是第一步，下面几个是平台跳跃的标配。

### 可变跳跃高度

按住跳得高，轻点跳得矮。做法是上升途中松开按键时，把向上的速度砍掉一部分：

```csharp
[SerializeField] private float jumpCutMultiplier = 0.5f; // 保留的上升速度比例，越小跳得越矮

if (Input.GetKeyUp(KeyCode.Space) && rb.linearVelocityY > 0f)
{
    rb.linearVelocityY *= jumpCutMultiplier;
}
```

判断 `linearVelocityY > 0f` 是为了只削弱**上升**过程；如果在下落时乘，会变成「松手下落更快」，那是另一套效果。

### 分开调上升与下落的重力

只靠 `jumpForce` 调高度，很容易陷入「跳得高但下落拖沓」的循环。常见做法是上升时重力小、下落时重力大，跳跃显得干脆利落：

```csharp
[SerializeField] private float riseGravity = 3f; // 上升时的重力倍率
[SerializeField] private float fallGravity = 6f; // 下落时的重力倍率

void FixedUpdate()
{
    rb.gravityScale = rb.linearVelocityY < 0f ? fallGravity : riseGravity;
}
```

`gravityScale` 是 [Rigidbody2D](/entertainment/unity/components/rigidbody-2d) 上的重力倍率，与其每帧算一次加法，不如直接改这个倍率。

### 土狼时间（Coyote Time）

玩家刚走出平台边缘的几帧内还允许跳，避免「明明看着还在地上却跳不起来」的挫败感：

```csharp
[SerializeField] private float coyoteTime = 0.1f;
private float coyoteCounter;

void FixedUpdate()
{
    if (isOnTheGround)
    {
        coyoteCounter = coyoteTime; // 站在地上就持续刷新
    }
    else
    {
        coyoteCounter -= Time.fixedDeltaTime; // 离地后开始倒计时
    }
}
```

### 跳跃缓冲（Jump Buffer）

反过来，落地前几帧按下跳跃键，落地那一刻自动补上跳跃。写在 `Update` 里，用 `Time.deltaTime` 倒计时：

```csharp
[SerializeField] private float jumpBufferTime = 0.1f;
private float jumpBufferCounter;

void Update()
{
    if (Input.GetKeyDown(KeyCode.Space))
    {
        jumpBufferCounter = jumpBufferTime;
    }
    else
    {
        jumpBufferCounter -= Time.deltaTime;
    }
}
```

这两个配合起来，判定条件就从「现在正好站在地上且正好按下」变成「**最近按过跳**且**最近在地上**」，手感会好很多：

```csharp
if (jumpBufferCounter > 0f && coyoteCounter > 0f)
{
    rb.linearVelocityY = jumpForce;
    jumpBufferCounter = 0f; // 用掉这次输入，防止一直跳
    coyoteCounter = 0f;     // 用掉这次落地宽限，防止同一次输入连跳
}
```

## 完整代码

把你原来的 `Player` 按上面的思路整合一下，注释里标了每一段对应的小节：

```csharp
using UnityEngine;

public class Player : MonoBehaviour
{
    private Animator anim;
    private Rigidbody2D rb;
    private float xInput;

    [Header("移动")]
    [SerializeField] private float moveSpeed = 9f;

    [Header("跳跃")]
    [SerializeField] private float jumpForce = 10f;
    [SerializeField] private float jumpCutMultiplier = 0.5f; // 松手后保留的上升速度比例
    [SerializeField] private float riseGravity = 3f;          // 上升时的重力倍率
    [SerializeField] private float fallGravity = 6f;          // 下落时的重力倍率
    [SerializeField] private float coyoteTime = 0.1f;         // 离地后仍可跳的宽限时间
    [SerializeField] private float jumpBufferTime = 0.1f;     // 落地前按跳的缓存时间

    [Header("地面检测")]
    [SerializeField] private float groundCheckDistance = 1.5f;
    [SerializeField] private bool isOnTheGround;
    private LayerMask groundLayer;

    private float coyoteCounter;
    private float jumpBufferCounter;
    private bool hasIsMovingParam;

    void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
        anim = GetComponentInChildren<Animator>();
        groundLayer = LayerMask.GetMask("Ground");

        if (rb == null) Debug.LogError($"[{gameObject.name}] 没有挂 Rigidbody2D！");
        if (anim == null) Debug.LogError($"[{gameObject.name}] 没有挂 Animator！");
        if (groundLayer == 0) Debug.LogError($"[{gameObject.name}] 没有设置 Ground Layer！");

        foreach (AnimatorControllerParameter param in anim.parameters)
        {
            if (param.name == "isMoving")
            {
                hasIsMovingParam = true;
                break;
            }
        }
        if (!hasIsMovingParam)
        {
            Debug.LogError($"[{gameObject.name}] Animator 没有 isMoving 参数！");
        }
    }

    void Start()
    {
        xInput = 0f;
    }

    void Update()
    {
        // 输入：横向每帧读一次
        xInput = Input.GetAxisRaw("Horizontal");

        // 跳跃缓冲：记录「最近按过跳」
        if (Input.GetKeyDown(KeyCode.Space))
        {
            jumpBufferCounter = jumpBufferTime;
        }
        else
        {
            jumpBufferCounter -= Time.deltaTime;
        }

        // 可变跳跃高度：上升途中松手就削弱速度
        if (Input.GetKeyUp(KeyCode.Space) && rb != null && rb.linearVelocityY > 0f)
        {
            rb.linearVelocityY *= jumpCutMultiplier;
        }

        // 动画
        if (anim && hasIsMovingParam)
        {
            anim.SetBool("isMoving", xInput != 0f);
        }

        // 翻转
        if (xInput > 0f)
        {
            transform.rotation = Quaternion.Euler(0, 0, 0);
        }
        else if (xInput < 0f)
        {
            transform.rotation = Quaternion.Euler(0, 180, 0);
        }
    }

    void FixedUpdate()
    {
        if (rb == null) return;

        // 移动
        rb.linearVelocityX = xInput * moveSpeed;

        // 地面检测
        isOnTheGround = Physics2D.Raycast(
            transform.position, Vector2.down, groundCheckDistance, groundLayer);

        // 土狼时间：在地上就刷新，离地就倒计时
        if (isOnTheGround)
        {
            coyoteCounter = coyoteTime;
        }
        else
        {
            coyoteCounter -= Time.fixedDeltaTime;
        }

        // 跳跃：最近按过跳 且 最近在地上
        if (jumpBufferCounter > 0f && coyoteCounter > 0f)
        {
            rb.linearVelocityY = jumpForce;
            jumpBufferCounter = 0f;
            coyoteCounter = 0f;
        }

        // 上升慢、下落快
        rb.gravityScale = rb.linearVelocityY < 0f ? fallGravity : riseGravity;
    }

    private void OnDrawGizmos()
    {
        // 地面检测射线的可视化
        Gizmos.color = Color.red;
        Gizmos.DrawLine(transform.position, transform.position + Vector3.down * groundCheckDistance);
    }
}
```

## 常见坑

| 现象 | 原因 |
| --- | --- |
| 永远跳不起来 | 检测长度太短、起点在角色中心、`groundLayer` 是 `0`、地面物体没设成 `Ground` 层 |
| 无限跳 | `LayerMask` 传了 `0` 或包含了角色自己的层 |
| 按键时灵时不灵 | 在 `FixedUpdate` 里直接读 `Input.GetKeyDown`，漏帧了 |
| 空中也能反复跳 | 只判断了「按下」，没判断 `isOnTheGround` |
| 跳起来像飘 / 像砸 | 上升和下落用了同一个 `gravityScale` |
| 贴墙时反复触发跳跃 | 侧面也被算成地面（射线太短、检测圈被墙挡住），可以缩短检测长度或改用脚底检测点 |

跳跃的判定参数（`jumpForce`、两个 `gravityScale`、检测距离）都是互相牵连的，改一个就要重新试手感，建议都用 `[SerializeField]` 暴露到 Inspector 里调（见[特性（Attribute）](/entertainment/unity/attribute)），不要写死在代码里。

## 相关阅读

- [Rigidbody2D 刚体](/entertainment/unity/components/rigidbody-2d) —— 速度、重力倍率、物理帧
- [输入系统](/entertainment/unity/input-system) —— `GetKeyDown` 与 `GetKey` 的区别
- [Unity 执行顺序](/entertainment/unity/execution-order) —— `Update` 与 `FixedUpdate` 的时机
- [特性（Attribute）](/entertainment/unity/attribute) —— `[SerializeField]`、`[Header]` 的用法
