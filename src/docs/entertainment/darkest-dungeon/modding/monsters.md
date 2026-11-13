# 怪物制作（Monsters）

##  概述

制作一个怪物包含以下内容：

- 怪物的动画
- 怪物的信息
- 怪物的大脑
- 怪物的战利品表
- 怪物的配队

```text
xxxMod/
├─ dungeons/
│  └─ xx地区(cove,crypts,...)/
│     └─ xxxx.地区名.1/3/5.mash.darkest   <= 该地区各难度的怪物编队
├─ monsters/
│  └─ xxxmonster/                        <= 怪物文件夹
│     ├─ anim/                            <= 动画，即怪物的动作
│     ├─ xxxmonster_A/
│     │  ├─ xxxmonster_A.art.darkest      <= 动画的使用文件
│     │  └─ xxxmonster_A.info.darkest     <= 怪物信息
│     ├─ xxxmonster_B/
│     ├─ xxxmonster_C/
│     └─ fx/                              <= 特效，比如挥刀时的刀光
├─ localization/                          <= 本地化
├─ loot/
│  └─ xxx.loot.json                       <= 战利品表
└─ raid/
   └─ ai/
      └─ xxxx.monster_brains.json         <= 怪物 AI
```

## 怪物信息文件（.info.darkest）

每行开头你都会看到一个单词加一个冒号（`:`）。它们一般用来说明该行包含什么样的数据，下面用一张表来介绍每行的基本含义。与这里的大多数其他部分一样，我们也鼓励你去查看其他示例，因为有些特殊情况和机制只存在于某个特定的敌人文件中。

| 字段 | 说明 |
| --- | --- |
| `display:` | 该行只包含一个变量，即怪物会占用的空间大小。 |
| `enemy_type:` | 该行可以重复多次，用来确定敌人属于哪些类别。这些类别会被那些需要在描述中指定敌人类别的效果和增益使用。 |
| `stats:` | 该行包含敌人的生命、防护、闪避、速度以及各种抗性。 |
| `skill:` | 表示紧随其后的变量属于一个敌人技能。通常大多数技能都会有一组非常相似的信息，这些信息应当一目了然。 |
| `personality:` | 一个过时且多余的变量。保持为 `-1` 以避免出现问题。 |
| `loot:` | 该行可以重复多次，用来确定敌人死亡时调用哪些战利品表，以及调用该表的次数。 |
| `initiative:` | 该行包含决定敌人每回合可以行动多少次的变量。 |
| `monster_brain:` | 敌人所使用的 AI 大脑的 id。 |
| `death_class:` | 该行决定敌人在死亡时会变成哪种怪物类别。如你所见，割喉者（cutthroat）会变成一具尸体。 |
| `battle_modifier:` | 该行主要包含布尔值（本示例中全部是布尔值，但其他敌人还有其他修饰符）。割喉者示例中的这些布尔值决定了诸如拖延惩罚和突袭机制等内容。 |

以强盗割喉者（brigand_cutthroat）为例：

```text
display: .size 1
enemy_type: .id "man"
stats: .hp 12 .def 2.5% .prot 0.15 .spd 3 .stun_resist 25% .poison_resist 20% .bleed_resist 20% .debuff_resist 15% .move_resist 25%
skill: .id "double_slice" .type "melee" .atk 72.5% .dmg 3 5 .crit 12%  .effect "Cutthroat Slice Debuff 1" .launch 123 .target ~12
skill: .id "uppercut_slice" .type "melee" .atk 72.5% .dmg 2 4 .crit 6%  .effect "Push 1A" .launch 12 .target 123
skill: .id "bandit_stabby" .type "melee" .atk 72.5% .dmg 4 8 .crit 6%  .effect "Minor Bleed 1" .launch 123 .target 1234
skill: .id "bandit_stabby_weak" .type "melee" .atk 42.5% .dmg 2 4 .crit 0%  .effect "Cutthroat Poke Buff" .launch 4 .target 1234 .move 0 1 .is_crit_valid False
personality: .prefskill -1
loot: .code "C" .count 1
initiative: .number_of_turns_per_round 1
monster_brain: .id brigand_cutthroat_A
death_class: .monster_class_id corpse_A .is_valid_on_crit False .type "corpse" 
life_link: .base_class "brigand_cannon"
battle_modifier: .accelerate_stall_penalty False .disable_stall_penalty False .can_surprise True .can_be_surprised True .always_surprise False .always_be_surprised False
wave_spawning: .prefers_front True
```

## 怪物大脑（AI）

### 技能选择倾向（Skill Selection Desires）

本部分介绍敌人 AI 的基本技能选择倾向。下面列出的并非全部，但足以作为一个不错的入门起点。如果你想模仿某种特定效果，别害怕去翻看某个具体敌人的 AI。下面给出示例与说明！

这些倾向都写在怪物大脑的 `skill_selection_desires` 数组中，下面的示例取自游戏本体的 `raid/ai/base.monster_brains.json`。

| 类型 | 说明 | 官方示例 |
| --- | --- | --- |
| `random_skill` | 随机选择一个技能。 | [图片](https://images.steamusercontent.com/ugc/91595569764558510/3BFCB0CF9E58973EBD47F84BFA757F959544346F/) |
| `specific_skill` | 选择指定的技能。 | [图片](https://images.steamusercontent.com/ugc/91595569764558534/F4F582514D3C12F49C280CD09D3B6221481C579D/) |
| `heal_skill` | 有效目标的生命值低于给定阈值时，选择带有治疗效果的技能。 | [图片](https://images.steamusercontent.com/ugc/91595569764558468/5488557AECA519D0A98B7A3B02308BEA34423821/) |
| `effect_key_status_skill` | 根据英雄是否具有指定状态（如眩晕、中毒、流血），选择带有针对该状态效果的技能。 | [图片](https://images.steamusercontent.com/ugc/91595569764558455/8E6B073366EF1DD3848500E25D6FAACFB9726617/) |
| `ally_alive_skill` | 指定基础类型的友方怪物仍然存活时，选择相应技能。 | [图片](https://images.steamusercontent.com/ugc/91595569764558415/E489276B21B3B4B9C1D4054643454992207AB86A/) |
| `ally_dead_skill` | 当前遭遇战中指定的友方怪物不存活时，选择相应技能。 | [图片](https://images.steamusercontent.com/ugc/91595569764558439/F29D8ACCB7B730E6FA9629930246A4A2BED51941/) |
| `performing_turn_skill` | 在怪物指定的实际行动次数上，将该技能的基础选择概率加入候选；计数依据是怪物实际行动，而非战斗回合数。 | [图片](https://images.steamusercontent.com/ugc/91595569764558500/FA0102DAC9EDB631F8B3C6F68D993DE2F4A83E5C/) |

#### random_skill

怪物会随机选择一个技能来使用。

示例（来自大脑 `test`）：

```json
{
    "type": "random_skill",
    "data": {
        "base_chance": 1.0
    }
}
```

#### specific_skill

怪物会使用某个指定的技能。

示例（来自大脑 `swine_prince`，指定使用 `obliterate_blind`）：

```json
{
    "type": "specific_skill",
    "data": {
        "base_chance": 1.0,
        "combat_skill_id": "obliterate_blind"
    }
}
```

#### heal_skill

当某个有效目标的当前生命值低于给定阈值时，怪物会使用任何附带治疗效果的技能。

示例（来自大脑 `default`，阈值为 50%）：

```json
{
    "type": "heal_skill",
    "data": {
        "base_chance": 100.0,
        "hp_ratio_threshold": 0.5
    }
}
```

#### effect_key_status_skill

如果某个攻击带有针对特定状态（眩晕、中毒、流血等）的效果，该倾向会让怪物根据是否有英雄处于所定义的状态来选择技能。

示例（来自大脑 `swine_prince`）：

```json
{
    "type": "effect_key_status_skill",
    "data": {
        "base_chance": 10.0,
        "effect_key_status": "tagged"
    }
}
```

#### ally_alive_skill

如果另一只指定基础类型的怪物仍然存活，怪物就会使用某个技能。

示例（来自大脑 `hag_B`：只要 `cauldron_full` 还活着，巫婆（Hag）就会使用 `hag_taste`）：

```json
{
    "type": "ally_alive_skill",
    "data": {
        "base_chance": 1.0,
        "combat_skill_id": "hag_taste",
        "ally_base_class_id": "cauldron_full"
    }
}
```

#### ally_dead_skill

如果在当前遭遇战中指定的怪物不存活，怪物就会使用某个技能。

示例（来自大脑 `swine_prince`：猪仔 `swine_piglet` 死亡后，猪人王子会使用 `obliterate_enraged`）：

```json
{
    "type": "ally_dead_skill",
    "data": {
        "base_chance": 1000.0,
        "combat_skill_id": "obliterate_enraged",
        "ally_base_class_id": "swine_piglet"
    }
}
```

#### performing_turn_skill

在怪物指定的实际行动次数（performing initiative）上，该技能的基础选择概率会被加入选择池。这里指定的是怪物第几次实际行动，而不是战斗的第几回合。示例中的巨人如果在第一回合首次行动前被眩晕，导致未能行动，那么它在第二回合首次实际行动时，仍会应用这个技能选择倾向。

示例（来自大脑 `giant_B`，`performing_turn: 1`）：

```json
{
    "type": "performing_turn_skill",
    "data": {
        "base_chance": 3.0,
        "combat_skill_id": "confusion_spores",
        "performing_turn": 1
    }
}
```

### 完整案例：猪人王子（swine_prince）

下面以猪人王子的大脑为例，说明一个 AI 如何组合技能选择、目标选择和额外行动。技能与目标倾向的基本含义可参照 [Steam 官方 Modding 指南](https://steamcommunity.com/sharedfiles/filedetails/?id=819597757)；以下对字段组合及最终行为的分析基于这份配置，技能的具体效果仍由 `.info.darkest` 和效果文件定义。

#### 完整配置

这是一个大脑对象，实际使用时应放入 `monster_brains.json` 的相应列表中。作为独立 JSON 示例，结尾不保留原列表中的逗号。

```json
{
    "id": "swine_prince",
    "skill_cooldowns": [],
    "skill_selection_desires": [
        {
            "type": "effect_key_status_skill",
            "data": {
                "base_chance": 10.0,
                "effect_key_status": "tagged"
            }
        },
        {
            "type": "specific_skill",
            "data": {
                "base_chance": 1.0,
                "combat_skill_id": "obliterate_blind"
            }
        },
        {
            "type": "ally_dead_skill",
            "data": {
                "base_chance": 1000.0,
                "combat_skill_id": "obliterate_enraged",
                "ally_base_class_id": "swine_piglet"
            }
        }
    ],
    "target_selection_desires": [
        {
            "type": "random_target",
            "data": {
                "base_chance": 2.0,
                "specific_combat_skill_id": "",
                "is_exclusive_desire": false,
                "is_enemy_target_desire": true,
                "is_friendly_target_desire": false
            }
        },
        {
            "type": "marked_target",
            "data": {
                "base_chance": 10.0,
                "specific_combat_skill_id": "",
                "is_exclusive_desire": false,
                "is_enemy_target_desire": true,
                "is_friendly_target_desire": false
            }
        }
    ],
    "bonus_initiative_desires": [
        {
            "type": "ally_last_damaged",
            "data": {
                "is_round_start": false,
                "is_round_in_progress": true,
                "is_round_finish": true,
                "is_pre_turn": false,
                "is_post_turn": true,
                "combat_skill_id_override": "obliterate_enraged",
                "ally_base_class_id": "swine_piglet",
                "ignore_if_stun": true
            }
        }
    ]
}
```

#### 1. 大脑的构成

| 字段 | 本例内容 | 职责 |
| --- | --- | --- |
| `id` | `"swine_prince"` | 大脑的标识符，供怪物信息文件中的 `monster_brain:` 引用。 |
| `skill_cooldowns` | `[]` | 本例未在大脑中配置技能冷却条目；技能自身的其他限制仍需查看技能定义。 |
| `skill_selection_desires` | 三条技能选择倾向 | 决定普通行动时倾向使用哪些技能。 |
| `target_selection_desires` | 随机目标、标记目标 | 决定所选技能倾向攻击哪些有效目标。 |
| `bonus_initiative_desires` | 猪仔受伤后的额外行动 | 在指定检查时机满足条件时，申请额外行动，并指定该行动使用的技能。 |

普通行动可按“筛选可用技能 → 根据技能倾向选择技能 → 根据目标倾向选择合法目标”理解。额外行动有单独的触发规则，本例还通过 `combat_skill_id_override` 指定了反击技能。

#### 2. 技能选择：标记攻击、备用攻击与狂怒攻击

`base_chance` 在这里应按选择权重理解，而不是直接当作百分比。`10.0` 不表示 10%，`1000.0` 也不表示 1000%；实际选择还取决于生效倾向、可用技能和有效目标。

| 倾向 | 条件与权重 | 本例作用 |
| --- | --- | --- |
| `effect_key_status_skill` | `effect_key_status: "tagged"`，权重 `10.0` | 根据英雄的标记状态，偏向选择效果中针对该状态的技能。该条目没有直接指定技能 ID，需结合技能效果判断哪些技能符合条件。 |
| `specific_skill` | `combat_skill_id: "obliterate_blind"`，权重 `1.0` | 为 `obliterate_blind` 提供基础选择倾向；没有合适的标记相关技能时，它可作为备用攻击。 |
| `ally_dead_skill` | `swine_piglet` 不存活，权重 `1000.0` | 为 `obliterate_enraged` 提供远高于其他条目的权重，使普通行动强烈偏向狂怒攻击。 |

这里的技能选择倾向会共同参与选择，不能把三条配置理解成依次执行的 `if / else`。猪仔死亡后的 `1000.0` 是极高权重，也不能仅凭这个数值断言每次都必定选择狂怒技能。

#### 3. 目标选择：偏向被标记的英雄

| 字段 | 示例值 | 本例含义 |
| --- | --- | --- |
| `type` | `"random_target"` / `"marked_target"` | 分别提供随机选目标和偏向标记目标的倾向。 |
| `base_chance` | `2.0` / `10.0` | 标记目标倾向的权重高于随机目标倾向。 |
| `specific_combat_skill_id` | `""` | 未把目标倾向限定到某个指定技能。 |
| `is_exclusive_desire` | `false` | 未设置为排他倾向，随机与标记目标倾向可以共同参与选择。 |
| `is_enemy_target_desire` | `true` | 用于选择怪物的敌方目标，即英雄。 |
| `is_friendly_target_desire` | `false` | 不用于选择怪物一方的友军目标。 |

有可攻击的标记英雄时，AI 更倾向攻击他们；没有合法标记目标时，随机倾向仍可提供目标选择。标记并不意味着无视技能的攻击范围、位置和目标数量限制。也不能直接用 `10 / (10 + 2)` 计算某一名英雄被攻击的概率，因为目标数量与倾向如何分配权重同样会影响结果。

技能选择中的 `tagged` 和目标选择中的 `marked_target` 分别处理“使用什么技能”和“攻击谁”，共同形成围绕标记的攻击行为。这份大脑本身不负责给英雄施加标记，标记来源需查看猪仔的技能等配套配置。

#### 4. 额外行动：猪仔受伤后反击

`ally_last_damaged` 与普通技能选择里的 `ally_dead_skill` 是两条不同机制：前者检查指定友军受伤的事件，后者检查指定友军是否仍存活。

| 字段 | 本例值 | 作用 |
| --- | --- | --- |
| `type` | `"ally_last_damaged"` | 检查最近受伤的友军是否符合指定基础类型。 |
| `ally_base_class_id` | `"swine_piglet"` | 关注猪仔的基础类型。 |
| `combat_skill_id_override` | `"obliterate_enraged"` | 额外行动使用狂怒技能，覆盖普通的技能选择。 |
| `is_round_start` | `false` | 不在回合开始检查点启用该倾向。 |
| `is_round_in_progress` | `true` | 在回合进行中启用。 |
| `is_round_finish` | `true` | 在回合结束检查点启用。 |
| `is_pre_turn` | `false` | 不在行动前检查点启用。 |
| `is_post_turn` | `true` | 在行动后检查点启用，可用于响应刚发生的伤害。 |
| `ignore_if_stun` | `true` | 按字段名推断，眩晕时忽略这条额外行动倾向；具体眩晕检查及解除时序需在游戏中验证。 |

这组配置表达的是：猪仔受到伤害后，在允许的检查时机申请一次使用 `obliterate_enraged` 的额外行动。多个检查标志表示允许检查的时机，不能据此认定同一次伤害会在每个检查点各触发一次。实际触发次数、持续伤害是否触发及眩晕边界行为，需要结合游戏运行结果确认。

#### 5. 最终战斗表现

| 场景 | 对应机制 | 表现 |
| --- | --- | --- |
| 猪仔存活，有合法标记目标 | 标记状态技能倾向 + 标记目标倾向 | 普通行动偏向选择标记相关攻击，并攻击被标记的英雄。 |
| 猪仔存活，没有合适的标记目标 | 指定技能倾向 + 随机目标倾向 | 可使用 `obliterate_blind`，按合法目标范围进行攻击。 |
| 猪仔受到伤害 | `ally_last_damaged` 额外行动 | 满足检查条件时，使用 `obliterate_enraged` 进行额外反击，无需等到下一次普通行动。 |
| 猪仔死亡，猪人王子仍存活 | `ally_dead_skill` 的高权重 | 后续普通行动强烈偏向 `obliterate_enraged`，形成持续狂怒的行为。 |

因此，这个 AI 组合出了“平时追打标记目标、猪仔受伤时额外反击、猪仔死亡后持续狂怒”的战斗模式。额外反击和死亡后的普通狂怒攻击虽然使用同一个技能 ID，但触发方式不同。

这份 JSON 只决定技能选择和行动时机；`obliterate_enraged` 是否攻击全体、造成多少伤害、是否附带眩晕，必须查看该怪物的技能与效果定义，不能由技能 ID 或这份大脑配置单独确定。
