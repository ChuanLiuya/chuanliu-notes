# 仓库api

## `create`

- 创建一个新的实例。

```ts
const user = repository.create({
  id: 1,
  firstName: "大",
  lastName: "帅哥",
});

/**
 * 相当于：
 * const user = new User();
 * user.firstName = "大";
 * user.lastName = "帅哥";
 */
```

## `save`

- 保存给定实体或实体数组。
  如果实体已存在，则更新。
  如果实体不存在，则插入。
  支持部分更新，未定义属性会被跳过。
  返回已保存的实体或实体数组。

```ts
await repository.save(user);
await repository.save([category1, category2, category3]);
```

## `update`

通过实体ID，或给定条件更新实体。

```ts
await repository.update({ age: 18 }, { category: "ADULT" });
/**
 * UPDATE user SET category = ADULT
 * WHERE age = 18
 */

await repository.update(1, { firstName: "Rizzrak" });
/**
 * UPDATE user SET firstName = Rizzrak
 * WHERE id = 1
 */
```

## `delete`

- 通过实体ID或给定条件删除实体。

```ts
await repository.delete(1);
await repository.delete([1, 2, 3]);
await repository.delete({ firstName: "Timber" });
```

## `find`

- 查找符合给定`FindOptions`的实体

```ts
const timbers = await repository.find({
  where: {
    firstName: "Timber",
  },
});
```
