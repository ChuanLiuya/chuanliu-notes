# 本地化

::: tip
如果你不知道要汉化哪些内容，没关系，跳出蓝字之后根据蓝字内容汉化即可。
:::
## 第一步：编写xml文件
大约如下结构：
``` xml
<?xml version="1.0" encoding="UTF-8"?>
<root>
  <language id="english">
    <entry id="hero_class_name_littlepiglet"><![CDATA[Piglet]]></entry>
	
  </language>
   <language id="schinese">
    <entry id="hero_class_name_littlepiglet"><![CDATA[小猪威尔伯]]></entry>

  </language>
  </root>
```
命名xml文件时，必须是`xxx.string_table.xml`格式
## 第二步： xml转loc2

将xml文件拖到_windows里面的localization.exe中即可。

### 第三步：重命名loc2文件

如果不重命名，就会和原版的汉化文件冲突。需要改为`xxx_schinese.loc2`格式。