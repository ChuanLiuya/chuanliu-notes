# 评论系统设计

川柳 Hub 的评论系统支持**三级嵌套回复**，后端基于 NestJS + TypeORM，前端基于 Vue3 + NaiveUI，共享类型和工具函数通过 `@chuanliu-hub/shared` 包统一管理。

## 数据模型

### 评论表（comments）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键 |
| `content` | text | 评论内容 |
| `user` | ManyToOne → User | 评论者 |
| `post` | ManyToOne → Post | 所属文章 |
| `parent` | ManyToOne → Comment (nullable) | 直接父评论 |
| `rootComment` | ManyToOne → Comment (nullable) | 所属根评论 |
| `createdAt` | datetime | 创建时间 |

### 三级评论体系

```
一级评论（根评论）    parent = null,          rootComment = null
二级评论（直接回复）  parent = 一级评论,       rootComment = 一级评论
三级评论（回复的回复） parent = 二级/三级评论,  rootComment = 一级评论
```

核心设计：每条非根评论都直接持有 `rootComment` 引用，指向它所属的根评论。这样查询时可以高效地按根评论分组，无需递归遍历。

## 共享类型（@chuanliu-hub/shared）

### Comment 接口

```typescript
export interface Comment {
  id: string
  content: string
  user: CommentUser
  createdAt: string | Date
  parent?: Comment | null          // 直接父评论
  rootComment?: Comment | null     // 所属根评论
  post?: { id: string }
}
```

### RootComment 接口

```typescript
// 根评论 = Comment + 扁平 replies 列表
export interface RootComment extends Comment {
  replies: Comment[]
}
```

### 评论层级工具

```typescript
// packages/shared/src/utils/commentLevel.ts
export function getCommentLevel(comment: {
  parent?: { id: string } | null
  rootComment?: { id: string } | null
}): 1 | 2 | 3

export function isLevel3(comment): boolean
```

判断逻辑：

| 条件 | 层级 |
|------|------|
| `parent === null` | 一级 |
| `rootComment.id === parent.id` | 二级 |
| `rootComment.id !== parent.id` | 三级 |

