# Mod 副本制作

> 译自 Steam 官方指南《Darkest Dungeon - Modding Guide [Official]》中的副本（Quests）相关章节，内容保持原文结构与表述。

副本（Quests）在各个位于 `\campaign\quest` 的文件中设置。

## 第一步，设置目标

在`your_mod/campaign`文件夹中，创建`xxx.quest.types.json`文件：
``` json
{
    "goals": [
        {
            "id": "Hod_Goal_PrepareForNewYear",
            "type": "explore_room",
            "starting_items": [],
            "ignore_fog_of_war": false,
            "show_as_quest": true,
            "data": {
                "amount": 0,
                "percentage": 1
            }
        }
    ]
}
```
## 第二步，设置副本

在`your_mod/campaign`文件夹下，创建`xxx.quest.types.json`文件：
``` json
{
    "plot_quests": [
        {
            "id": "Hod_Plot_PrepareForNewYear",
            "has_achievement": true,
            "dungeon_level": 0,
            "is_started_by_event": true,
            "quest": {
                "is_plot_quest": true,
                "type": "explore",
                "dungeon": "warrens",
                "difficulty": 1,
                "length": 1,
                "map_name": "Hod_Map_ParepareForNewYear",   //地图
                "goal_ids": [
                    "Hod_Goal_PrepareForNewYear"    // 这个就是刚才设置的goal
                ],
                "completion_reward": {
                    "resolve_xp": 4,
                    "items_definition": {
                        "system_config_type": "quest_rewards",
                        "items": {
                            "0": {
                                "id": "",
                                "type": "gold",
                                "amount": 123456
                            }
                        }
                    }
                }
            },
            "additional_trinket_completion_rewards": [
                {
                    "rarity": "very_rare",
                    "amount": 1
                }
            ],
            "is_progression": false,
            "is_repeatable": false,
            "is_generated_by_event": true,
            "has_statue_contents": false,
            "completion_dungeon_xp": true,
            "is_town_progression_goals_enabled": false,
            "can_retreat": true,
            "retreat_always_from_raid": true,
            "retreat_party_kill_count": 0,
            "is_surprise_enabled": false,
            "is_scouting_enabled": true,
            "is_roster_stress_cleared_on_completion": true,
            "is_persistent_through_campaign" : false,
            "roster_buff_on_failure_minimum_party_resolve_level": 0,
            "upgrade_tags_to_remove_on_ignore": [],
            "upgrade_tags_to_remove_on_failure": [],
            "roster_buffs_to_apply_on_failure": [],
            "party_quirks_to_apply_on_completion": [],
            "party_quirks_to_apply_on_failure": [],
            "trinket_retention_minimum_rarity": "",
            "trinket_retention_count": 0,
            "has_quest_select_warnings": false,
            "has_provision_warnings": false,
            "suggested_trinkets": [],
            "additional_provisions": {
                "system_config_type": "quest_provision",
                "items": {}
            }
        }
    ]
}
```

## 第三步：编写副本地图

在 `your_mod/maps` 文件夹下编写你的 csv，它就是这副地牢的布局。地图必须按照固定格式编写，建议先下载模板，对照着改：

<a class="download-file" href="/files/darkest-dungeon/Hod_Map_ParepareForNewYear.csv" download>📄 下载地图模板 Hod_Map_ParepareForNewYear.csv</a>

::: tip 编写前的两个注意点
- **两个房间之间至少要有三条走廊**，其中直接连接两个房间的那条走廊必须是空的，也就是 `c;`。
- **怪物配队会从对应的 mash 文件中找**：地图所在地区和难度决定用哪个文件。例如地图是 `town`、1 级，那么只会从 `xxx.town.1.mash.darkest` 文件中寻找你的 named 配队。
:::

### 房间项（ROOM TILES）

| 写法 | 说明 |
| --- | --- |
| `room;entrance` | 初始房间。顾名思义，就是起点房间，你一旦进入该地牢，这里就是入口，简单明了 |
| `room;` | 空房间 |
| `room;mash` | 有敌人的房间。`mash` 是 room 的后缀属性，可以和 `curio` 共同使用 |
| `room;curio` | 有奇观的房间。`curio` 是 room 的后缀属性，可以和 `mash` 共同使用 |
| `r;final_room` | 结束房间。目前没用到这个属性，推测是跟任务目标有关 |

### 过道项（CORRIDOR TILES）

| 写法 | 说明 |
| --- | --- |
| `c;` | 空的过道 |
| `c;mash` | 有敌人的过道。`mash` 是其后缀属性，不能与 `curio`、`trap`、`obstacle` 混用 |
| `c;curio` | 有奇观的过道。`curio` 是其后缀属性，不能与 `mash`、`trap`、`obstacle` 混用 |
| `c;trap` | 有陷阱的过道。`trap` 是其后缀属性，不能与 `curio`、`mash`、`obstacle` 混用 |
| `c;obstacle` | 有障碍的过道。`obstacle` 是其后缀属性，不能与 `curio`、`trap`、`mash` 混用 |
| `c;hunger` | 推测是饥饿判定点，到了这个过道要吃饭。没有测试 |

### 组合写法

一个房间可以按照规则叠加后缀属性，把敌人、奇观写得更具体：

| 写法 | 含义 |
| --- | --- |
| `room;curio;mash` | 一个房间，有随机奇观、随机敌人。敌人和奇观根据当前地图确定 |
| `room;mash=red_lumber_mash` | 一个房间，有敌人，敌人是 dungeon 文件夹中某个 mash 文件里名字为 `red_lumber_mash` 的敌人。由此可以指定怪物生成 |
| `room;treasure=locked_strongbox;mash=tutorial_mash_03` | 一个房间，有奇观和敌人。奇观指定为锁住的宝箱，具体可以在 curio 里面找相应参数；敌人指定为 `tutorial_mash_03`，道理同上条 |
