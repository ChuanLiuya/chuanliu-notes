# 物品栏制作（Inventory）

## 通用字段

`inventory_item:` 表示开始定义一件物品，后面的 `.xxx` 为该物品的属性。以下示例值整理自宝石、补给和庄园物品条目；不同类型支持的字段和实际行为可能不同。

| 字段 | 示例值 | 说明 |
| --- | --- | --- |
| `.type` | `"gem"`、`"supply"`、`"estate"` | `gem`代表宝石，无作用只负责卖出。supply不可带回城镇，estate可带回城镇。 |
| `.id` | `"CL_NewYear_Inv_Gem_Test"`、`"bandage"` | 物品标识符 |
| `.base_stack_limit` | `1`、`5`、`6`、`12` | 堆叠上限。例如宝石示例为 `5`，绷带为 `6`。 |
| `.purchase_gold_value` | `0`、`75`、`150`、`250` | 购买单价。 写`0`时表示商店不卖。 |
| `.sell_gold_value` | `0`、`15`、`50`、`1750` | 出售价值 |
| `.can_modify_stack_limit` | `false`、`true` | 是否允许古董改堆叠。 |
| `.estate_can_be_provision` | `true` | 庄园物品是否可作为补给使用。要使用就true |
| `.use_id_take_sfx` | `true` | 拾取时使用与物品 ID 对应的音效。 |
| `.act_out_consume_priority` | `1` | 使用优先级。与奇物互动有关 |
| `.replace_buffs` | `true` | buff替换，写`true`则不能叠加buff |

## 宝石类型（gem）

`gem` 表示宝石类物品，可用于制作晶体等以出售换取金币为主要用途的战利品。这类物品通常没有战斗效果，任务结束后可兑换金币。

### 1. 创建物品配置

在 Mod 的 `inventory` 文件夹中创建 `xxxx.gem.inventory.items.darkest`。其中，`xxxx` 替换为自己的文件名前缀。

在文件中添加以下物品定义：

```text
inventory_item: .type "gem" .id "CL_NewYear_Inv_Gem_Test" .base_stack_limit 5 .can_modify_stack_limit false .purchase_gold_value 0 .sell_gold_value 1750
```

这个示例定义了一种基础堆叠上限为 **5**、每个价值 **1750 金币**的宝石。

### 2. 添加物品图标

将图标放在 Mod 的 `panels/gem` 文件夹中，文件名按 `inv_gem+物品ID.png` 的形式编写。这里的 `+` 是文件名的一部分。

对应上面的示例，图标路径为：

```text
panels/gem/inv_gem+CL_NewYear_Inv_Gem_Test.png
```

图标文件名中的物品 ID 应与配置中的 `.id` 保持一致。

### 3. 配置掉落（可选）

需要让该宝石通过掉落获得时，将它加入[战利品表（Loot）](./loot.md)，再让怪物或奇物引用相应的战利品表。

引用物品时使用 `.id` 的值，本例为 `CL_NewYear_Inv_Gem_Test`。

## supply 和 estate

supply没法带回城镇

而设置为不可带回的estate仍然会写入存档


