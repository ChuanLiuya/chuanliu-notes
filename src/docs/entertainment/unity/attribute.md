# 特性（Attribute）

写在字段上面的 `[SerializeField]` 这类中括号，是 C# 的**特性（Attribute）**。

理解它的关键是：**特性自己什么都不做，它只是往代码上贴标签。**

- 中括号里的内容会被编译成元数据，写进程序集
- 真正「做事」的是读标签的人：Unity 编辑器在你选中物体时读一遍，决定这个字段要不要显示在 Inspector 里；Unity 引擎启动时读一遍，决定哪些方法要调用；你自己的代码用反射读，拿到标注的信息
- 所以看到中括号，不该问「它会让代码怎么运行」，而该问「**谁在什么时候读它**」

::: tip 提示
本文只是个人学习笔记，更权威的内容建议查看[Unity 官方文档](https://docs.unity3d.com/cn/current/Manual/script-serialization.html)和[C# 特性文档](https://learn.microsoft.com/zh-cn/dotnet/csharp/advanced-topics/reflection-and-attributes/)
:::

## 语法

```csharp
// 单独写一个
[SerializeField] private float speed;

// 一个中括号里写多个，用逗号分隔
[SerializeField, Range(0, 10)] private float jumpHeight;

// 带位置参数
[Tooltip("移动速度，单位是米每秒")] private float moveSpeed;
[Range(0f, 1f)] private float alpha;
[Header("基础属性")] private int level;
[Space(10)] private string nickname;

// 带命名参数
[ColorUsage(true, true)] private Color glow;
```

类名以 `Attribute` 结尾时可以省略后缀，所以 `[SerializeField]` 的完整类名其实叫 `SerializeFieldAttribute`，`[Serializable]` 对应 `SerializableAttribute`，`[Obsolete]` 对应 `ObsoleteAttribute`。

### 目标前缀

有时候特性贴的位置不明确（比如贴在自动属性上，到底该作用到属性还是它背后的字段），可以用前缀指定：

| 写法 | 作用对象 |
| --- | --- |
| `[field: SerializeField]` | 自动属性背后的编译器生成字段 |
| `[property: ...]` | 属性本身 |
| `[return: ...]` | 方法返回值 |
| `[assembly: ...]` | 整个程序集，只能写在文件最顶部 |

## Unity 常用特性

### Inspector 显示相关

| 特性 | 作用 |
| --- | --- |
| `[SerializeField]` | 让私有字段参与序列化并显示 |
| `[HideInInspector]` | 序列化，但不显示 |
| `[System.NonSerialized]` | 完全不参与序列化 |
| `[Tooltip("说明")]` | 鼠标悬停在字段上时的提示 |
| `[Header("标题")]` | 在字段上方加一行标题 |
| `[Space(10)]` | 空出一点间距 |
| `[Range(0, 100)]` | 变成滑条 |
| `[Min(0)]` | 限制最小值，输入时自动钳制 |
| `[Multiline(3)]` / `[TextArea(2, 5)]` | 多行文本框 |
| `[ColorUsage(true, true)]` | HDR、带 Alpha 的颜色选择器 |
| `[GradientUsage(true)]` | HDR 渐变色 |
| `[Delayed]` | 输入完成（回车或失焦）后才提交，适合会触发重算的字段 |

### 组件与对象相关

| 特性 | 作用 |
| --- | --- |
| `[RequireComponent(typeof(Rigidbody2D))]` | 挂上这个脚本时自动补上依赖组件 |
| `[DisallowMultipleComponent]` | 同一个物体不能挂多个 |
| `[AddComponentMenu("My/Player")]` | 改 Add Component 菜单里的路径 |
| `[ExecuteAlways]` / `[ExecuteInEditMode]` | 编辑模式下也执行生命周期 |
| `[SelectionBase]` | Scene 里点选子物体时优先选中它 |
| `[CreateAssetMenu(...)]` | 让 `ScriptableObject` 能在右键菜单里创建 |
| `[ContextMenu("重置")]` | 给组件右上角的齿轮菜单加一项 |
| `[ContextMenuItem("重置", "ResetValue")]` | 给字段的右键菜单加一项 |
| `[HelpURL("https://...")]` | 点组件上的文档图标打开的链接 |

### 编译与序列化相关

| 特性 | 作用 |
| --- | --- |
| `[Serializable]` | 让自定义类可以被序列化 |
| `[SerializeReference]` | 序列化接口或多态引用 |
| `[FormerlySerializedAs("旧名字")]` | 字段改名后仍能读到旧数据 |
| `[Obsolete("用 XXX 代替")]` | 调用时产生编译警告 |
| `[Conditional("DEBUG")]` | 满足条件才编译对这个方法的调用 |
| `[RuntimeInitializeOnLoadMethod]` | 游戏启动时自动调用，不用挂脚本 |
| `[CustomEditor(typeof(X))]` | 给组件指定自定义 Inspector（编辑器代码） |
| `[CustomPropertyDrawer(typeof(Y))]` | 给特性或类型指定绘制器（编辑器代码） |

## SerializeField

回到最开头那句话：「`[SerializeField]` 让私有变量也能在 Inspector 面板里被看到、被修改」，基本对，但因果说反了一点——它的本质是**让私有字段参与序列化**，「能显示和编辑」只是被序列化的结果。所以它属于**序列化（Serialization）**方面的内容，和 `[Serializable]`、`[HideInInspector]`、`[NonSerialized]` 是一家人。

### 默认规则

| 字段声明 | 是否序列化 | Inspector 可见 |
| --- | --- | --- |
| `public int a;` | 是 | 是 |
| `private int b;` | 否 | 否 |
| `[SerializeField] private int c;` | 是 | 是 |
| `[HideInInspector] public int d;` | 是 | 否 |
| `[System.NonSerialized] public int e;` | 否 | 否 |

`public` 字段默认就参与序列化，加 `[SerializeField]` 是给 `private` / `protected` 字段开权限；`[HideInInspector]` 则相反，序列化但不显示。

### 前提条件

- 不能是 `static`、`const`、`readonly`
- 类型本身可序列化：基本类型、`string`、`Vector2` / `Vector3`、`Color`、`Object` 引用、数组和 `List<T>`，或者标了 `[Serializable]` 的自定义类
- 必须是字段，属性（`{ get; set; }`）不会被序列化，只想要自动属性可调时用 `[field: SerializeField]`

::: warning 警告
`Dictionary<TKey, TValue>` 不能被序列化，Inspector 里不会显示。要存字典，得自己拆成两个 `List`，或者改成可序列化的键值对数组。
:::

```csharp
using System;
using System.Collections.Generic;
using UnityEngine;

[Serializable]
public class WeaponData
{
    public string weaponName;
    public int damage = 10;
    public float range = 2.5f;
}

public class Player : MonoBehaviour
{
    [SerializeField] private float moveSpeed = 5f;   // 私有字段，但能在 Inspector 里调
    [SerializeField] private WeaponData weapon;      // 自定义类要先标 [Serializable]
    [SerializeField] private List<Transform> waypoints;

    [HideInInspector] public int debugCount;         // 会被保存，但不显示
    [NonSerialized] public int runtimeCache;         // 完全不参与序列化

    [field: SerializeField] public int Hp { get; private set; }
}
```

## 自定义特性

自己写特性有两种方向：

1. **纯标记**：继承 `System.Attribute`，运行时用反射读
2. **加 Inspector 功能**：继承 `PropertyAttribute`，再配一个 `PropertyDrawer`

```csharp
using UnityEngine;

// 1. 定义特性：给字段加一段说明文字
public class CommentAttribute : PropertyAttribute
{
    public string text;

    public CommentAttribute(string text)
    {
        this.text = text;
    }
}
```

```csharp
#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;

// 2. 定义绘制器：告诉 Inspector 这个特性和字段该怎么画
[CustomPropertyDrawer(typeof(CommentAttribute))]
public class CommentDrawer : PropertyDrawer
{
    public override void OnGUI(Rect position, SerializedProperty property, GUIContent label)
    {
        var comment = (CommentAttribute)attribute;

        // 上半行画注释，下半行画字段
        Rect commentRect = new(position.x, position.y, position.width, EditorGUIUtility.singleLineHeight);
        Rect fieldRect = new(position.x, commentRect.yMax, position.width, EditorGUIUtility.singleLineHeight);

        EditorGUI.HelpBox(commentRect, comment.text, MessageType.None);
        EditorGUI.PropertyField(fieldRect, property, label);
    }

    // 不重写高度会重叠
    public override float GetPropertyHeight(SerializedProperty property, GUIContent label)
    {
        return EditorGUIUtility.singleLineHeight * 2f + 2f;
    }
}
#endif
```

用起来就是：

```csharp
[Comment("血量不要低于 100，否则开局就会被秒")]
[SerializeField] private int hp = 100;
```

纯标记的特性则是在运行时读：

```csharp
var field = typeof(Player).GetField("hp", BindingFlags.NonPublic | BindingFlags.Instance);
var comment = field.GetCustomAttribute<CommentAttribute>();
```

## 踩坑记录

- 特性不会改变代码逻辑，忘记「谁读它」就等于白写
- 编辑器相关的特性（`[CustomEditor]`、`[MenuItem]`、`[CustomPropertyDrawer]`）必须放在 `Editor` 文件夹里或包在 `#if UNITY_EDITOR` 中，否则打包会报错
- 改了 `[SerializeField]` 字段的名字，Inspector 里原来的值会变回默认值，因为序列化数据按字段名匹配，记得加 `[FormerlySerializedAs("旧名字")]`
- 加了 `[SerializeField]` 却什么都没出现，先检查类型能不能序列化，`Dictionary`、接口、没标 `[Serializable]` 的自定义类都不行
- 运行时用代码改的值不会写回场景或预制体，退出播放模式就还原了，只有编辑器里手改的才会保存
- `[ExecuteAlways]` 很方便，但编辑模式下 `Update` 也会跑，小心把场景数据改坏
- 特性是编译期确定的，没法在运行时动态加上去
- `public` 字段虽然方便，但会暴露给所有外部脚本，能用 `[SerializeField] private` 就别用 `public`
