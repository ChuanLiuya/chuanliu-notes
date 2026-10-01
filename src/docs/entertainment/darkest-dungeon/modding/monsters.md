# 怪物制作（Monsters）

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