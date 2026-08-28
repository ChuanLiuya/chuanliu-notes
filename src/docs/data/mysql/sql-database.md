# 数据库的操作

## 创建数据库

创建一个数据库：

```sql
create database test;
```

后面填写的是数据库的名字。

或者这样写：

```sql
CREATE DATABASE IF NOT EXISTS test;  -- 如果没有，则创建test数据库
```

如果已经存在，还执行`create database test`的话，会报错：

```bash
Can't create database 'test'; database exists
```
