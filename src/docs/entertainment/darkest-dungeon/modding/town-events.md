<script setup>
import WipTag from '@components/WipTag.vue'
</script>

# 城镇事件制作（Town Events）

## 文件位置

```text
Darkest Dungeon/
├─ campaign/town_events/town/…      <= 游戏自带的城镇事件
└─ mods/
   └─ xxxMod/                  <= mod名字
      ├─ project.xml                
      ├─ preview_icon.png                <= Mod 列表和创意工坊里的封面
      ├─ campaign/
      │  ├─ town
      │  │  └─ town_event
      │  │      └─ town_event.xxxxx.png   <= 事件图片
      │  └─ town_events/
      │    └─ my_event.town_event.json   <= 事件的json
      └─ localization/              ← 标题、描述等文本
```

## 具体内容

下面以游戏自带的「游牧商队饰品打折」事件为例：

```json
{
	"id": "nomad_wagon_trinket_discount",   //事件 ID，供其他文件引用。
	"base_chance": 3.0, // 事件出现的基础概率
	"per_not_rolled_additional_chance": 0.0,    //每次没roll到就加多少
	"cooldown": 2,  //距离下次被抽中中间间隔天数
	"requirements": {   //触发前要满足的条件集合
		"minimum_week": 6,
		"dead_heroes": 0,
		"hero_level_counts": [],
		"upgrades_purchased": [],
		"trinket_storage_count": 0
	},
	"town_ambience_paramater_ids": [],
	"tone": "neutral",  //事件基调
	"sprite": "town_event_nomad_new_year",  //事件图片
	"sprite_attachment": "nomad_wagon", //这个图片挂到建筑上
	"data": [   //事件的效果
		{
			"type": "upgrade_tag_discount",
			"string_data": "trinket",
			"number_data": 0.5
		}
	]
}
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `id` | 事件 ID，供其他文件引用。 |
| `base_chance` | 事件出现的基础概率。每周的实际百分比 = 这个数 ÷ 所有当前可用事件的 `base_chance` 之和。 |
| `per_not_rolled_additional_chance` | 每过一周，只要事件条件满足却没被抽中，就把这个数累加到基础概率上；事件一旦被抽中，概率重置回 `base_chance`。 |
| `cooldown` | 距离下次能被抽中，中间必须间隔的周数。 |
| `requirements` | 触发前必须满足的条件集合。 |
| `town_ambience_paramater_ids` | （原文档未说明） |
| `tone` | 事件的整体基调，可以填 `good`、`bad` 或 `neutral`。 |
| `sprite` | 事件激活时要启用的事件图片。 |
| `sprite_attachment` | 这张图片要挂到哪个建筑上（如果有的话）。 |
| `data` | 事件带来的效果集合：增益、城镇改动或者其他变化。 |