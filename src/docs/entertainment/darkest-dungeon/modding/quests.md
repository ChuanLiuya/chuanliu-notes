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

## 第三步： 编写副本

在 `your_mod/maps`文件夹下，编写你的csv。