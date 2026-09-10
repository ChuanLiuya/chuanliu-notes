# 数据表操作

## 创建数据表

创建一个表，需要以下信息：
- 表名字
- 表字段
- 定义每个表字段的数据类型

**语法**：

``` sql
create table table_name (
    column1 datatype,
    column2 datatype
)
```
- `table_name` 是你要创建的表的名称
- `column1` 是表的列名
- `datatype` 是每一列的数据类型

例如，我创建一个用户表：

``` sql
CREATE TABLE users (
    id CHAR(36) NOT NULL DEFAULT (UUID()) COMMENT '用户ID',
    username VARCHAR(255) NOT NULL COMMENT '用户名',
    email VARCHAR(100) NOT NULL COMMENT '邮箱',
    birthdate DATE COMMENT '出生日期',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```