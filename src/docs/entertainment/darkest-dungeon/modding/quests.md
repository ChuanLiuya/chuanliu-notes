# Mod 副本制作

> 译自 Steam 官方指南《Darkest Dungeon - Modding Guide [Official]》中的副本（Quests）相关章节，内容保持原文结构与表述。

副本（Quests）在各个位于 `\campaign\quest` 的文件中设置。

## quest.exit_penalty.json

副本退出。

```json
{
    "fail_penalty": {
        // 队伍无论何种原因导致副本失败时，所承受的压力伤害。
        "stress_damage": 20
    },
    "regroup_penalty": {
        "stress_damage": 0
    }
}
```

## quest.types.json

副本类型。
分为三个：
- `goals`
- `town_progression_goal_ids`
- `types`
```json
// quest.types.json ======== goals
// 这些是被指派给副本的副本目标，它们决定队伍必须完成什么，副本才算完成。
{
    "goals": [
        {
            "id": "tutorial_final_room",    //id： 遗迹教学关
            "type": "tutorial_room",    // 类型：教学
            "starting_items": [],   // 默认初始的物品，有些关卡需要物品互动等。
            "ignore_fog_of_war": false, //没看懂
            "show_as_quest": false, // 没看懂
            "data": {   // 额外数据？
                "room_id": "rooB"
            }
        },
        {
            "id": "kill_necromancer_A", // 杀死死灵法师学徒
            "type": "kill_monster", // 类型，杀死怪物
            "starting_items": [],
            "ignore_fog_of_war": false,
            "show_as_quest": true,
            "data": {
                "monster_class_ids": [ //怪物id
                    "necromancer_A" // 死灵法师学徒
                ],
                "amount": 1 // 一个
            }
        },
    ]
}
```

```json
// quest.types.json ====== town_progression_goal_ids
// 这四个变量位于本节的正上方，它们决定小镇要推进一周需要发生什么。 过周条件
{
     "town_progression_goal_ids": [
        "town_progression_explore", // 探索三个房间算过周
        "town_progression_battle", // 打两场算过周
        "town_progression_trait", // 没看懂
        "town_progression_deaths_door" // 进死门算过周
    ],
}
```

``` json
// quest.types.json ====== types
// 在这里你设置带有已定义目标的类型，以便在文件后面调用这些类型，让它们在指定的某一周生成
{
    "types": [
       { 
            "id": "explore",
            "goal_lists": [
                {
                    "dungeon": "all",
                    "goals": [
                        [
                            "explore_all_rooms"
                        ]
                    ]
                }
            ]
        }
    ]
},
```

## 副本 —— 剧情副本（Plot Quests）

剧情副本是指除了头狼以外，会一直保留直到完成的副本。它们通常是 Boss 副本，或发生在 Darkest Dungeon 中的副本，不过教程中的副本也被视为剧情副本。

### 基础区块

下面我们以一个这样的条目为例：学徒死灵法师（Apprentice Necromancer）Boss 副本。

![学徒死灵法师 Boss 副本示例](https://images.steamusercontent.com/ugc/82590107431633953/D7043A992F50795B759801B56012EDAA554F982A/)

| 变量          | 说明                                                                                 |
| ------------- | ------------------------------------------------------------------------------------ |
| id            | 该副本的 ID，供引用。                                                                |
| dungeon_level | 该副本出现前所需的副本等级。注意这不是副本的难度或长度，而是那颗骷髅头上显示的等级。 |
| is_plot_quest | 该布尔值把该副本标记为推进故事并生成后续副本所必需的副本。                           |
| type          | 副本类型，由上一节中列出的类型确定。                                                 |
| dungeon       | 该副本所在的区域。                                                                   |
| difficulty    | 副本的难度（通常为 1、3、5 或 6）                                                    |
| length        | 副本的长度（通常为 1、2 或 3）                                                       |
| goal_ids      | 剧情副本的目标。                                                                     |

### 奖励

接下来的这个小节将介绍副本的奖励。下图就是这个小区块，它同属那个学徒死灵法师副本。

![奖励区块示例](https://images.steamusercontent.com/ugc/82590107431633975/3DF0701B2FC92B7ED2D0EFD02844357C54116382/)

在这里你可以定义玩家成功完成所定义的副本后会获得哪些奖励。照此格式调整这些剧情副本的坚毅（resolve）、金币、传家宝和饰品奖励。

### 附加变量

剧情副本中的最后这个区块包含一些重要的变量；各类变量的说明请参照图片后面的表格。

![附加变量区块示例](https://images.steamusercontent.com/ugc/82593518793896816/186145370A6E897DE8EB08D2C764F9E5BAECFF43/)

| 变量                                               | 说明                                                                                                                  |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| is_progression                                     | 该布尔值决定该副本是否是在该区域推进到下一个剧情副本所必需的。                                                        |
| is_repeatable                                      | 该布尔值决定你在首次完成该副本后是否还能重复它。                                                                      |
| has_statue_contents                                | 该布尔值决定完成该副本时是否有雕像复选框内容。                                                                        |
| completion_dungeon_xp                              | 该布尔值决定是否依据后面的一张表给英雄额外的 XP。你多半会想把它设为 false，这样你就能亲自手动微调该副本的单个 XP 值。 |
| is_town_progression_goals_enabled                  | 该布尔值决定推进一周所需的条件是否启用。                                                                              |
| can_retreat                                        | 该布尔值决定是否允许玩家从副本中撤退。                                                                                |
| retreat_always_from_raid                           | 该布尔值决定你尝试从战斗中撤退时是否必定成功。若设为 'false'，你可能会失败。                                          |
| retreat_party_kill_count                           | 该值决定从副本撤退时自动死亡的队伍成员数量。                                                                          |
| is_surprise_enabled                                | 该布尔值决定副本期间是否启用惊吓（surprise）。                                                                        |
| is_scouting_enabled                                | 该布尔值决定副本期间是否启用侦察。                                                                                    |
| is_roster_stress_cleared_on_completion             | 该布尔值决定副本成功完成后，小镇中所有英雄的压力是否被清除。                                                          |
| upgrade_tags_to_remove_on_ignore                   | 若副本被无视（如 VVulf 那样），这一节可以展开描述应移除哪些小镇升级（如果有）。                                       |
| upgrade_tags_to_remove_on_failure                  | 若副本失败，这一节可以展开描述应移除哪些小镇升级（如果有）。                                                          |
| roster_buffs_to_apply_on_failure                   | 若副本失败，这一节可以展开描述要给整个小镇名册（roster）施加哪些增益（如果有）。                                      |
| roster_buff_on_failure_minimum_party_resolve_level | 若上一节填入了增益，该值表示施加该增益的最低英雄等级。                                                                |
| party_quirks_to_apply_on_completion                | 副本成功完成时施加给队伍的怪癖。                                                                                      |
| party_quirks_to_apply_on_failure                   | 副本失败时施加给队伍的怪癖。                                                                                          |
| trinket_retention_minimum_rarity                   | 副本从你的饰品库存中取走饰品的最低稀有度。                                                                            |
| trinket_retention_count                            | 副本将从你的库存中取走的饰品数量。                                                                                    |
| has_quest_select_warnings                          | 副本是否会在你没装备饰品时给出警告。                                                                                  |
| has_provision_warnings                             | 副本是否会对你应携带的补给数量给出警告。                                                                              |
| suggested_trinkets                                 | 这一节可以填入推荐的饰品，以便在玩家出发前给出提示。这可以在第二个 Darkest Dungeon 副本（更常被称为 DDQ2）中看到。    |
| additional_provisions                              | 这一节可以填写，用以决定出发队伍将获得的起始补给或物资。                                                              |

## 副本 —— 生成与限制

在 `quest.generation.json` 文件中，有一个更大的区块，包含逐周的生成数据。为了有效传达如此庞大的数据量，下面的表格将描述各数据集的一般性质与用途。

| 区块                                  | 说明                                                                                                                                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| number_of_quests_per_town_visit_table | 这一节的每一行代表特定的一周，随着游戏内周数的推进，会生成更多的副本。                                                                                                               |
| generated_dungeons                    | 对于每个可以自然生成副本的区域（非剧情副本），这一节可以定义每个区域开放并可生成副本前必须完成多少个副本。                                                                           |
| generated_resolve_level_difficulties  | 在这张小表中，你可以设定根据名册中拥有的坚毅（resolve）等级应生成什么等级的副本。                                                                                                    |
| available_quests_table                | 这张大得多的表决定了每个区域在哪些周有哪些副本可供生成。每个以方括号分隔开的表代表一周。一眼就能看出，遗迹（Ruins）的第一周只有一个副本能被生成 —— 一个短程的"剿灭"（exterminate）。 |
| heirloom_type_map                     | 这一节决定副本奖励中可以给出哪些传家宝。注意这只适用于副本奖励，不适用于战利品。                                                                                                     |
| heirloom_amount_table                 | 副本奖励中给予的传家宝数量。                                                                                                                                                         |
| item_table                            | 副本奖励中给予的金币数量。                                                                                                                                                           |
| resolve_xp_table                      | 成功完成副本后奖励给英雄的 XP 数量。                                                                                                                                                 |
| trinket_chance_table                  | 用于决定可作为副本奖励的饰品稀有度的饰品表。                                                                                                                                         |

### 等级限制

你可以在 `quest.restriction.json` 文件中找到等级限制。每一行代表允许参与某个副本的英雄的最高等级。把全部设为 6 或更高即可有效移除等级限制。
