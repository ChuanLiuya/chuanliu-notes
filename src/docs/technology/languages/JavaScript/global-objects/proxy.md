# Proxy

## 什么是 Proxy ？

proxy是javascript的一个内置对象。proxy对象允许你为另一个对象创建代理，代理可以拦截并重新定义该对象的基本操作。

::: tip

关于proxy更详细的介绍可以查阅[官方文档](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

:::

## 构造函数的参数

其构造函数有两个参数：

- `target`: 被代理的原始对象
- `handler`: 一个将拦截操作以及重新定义操作的对象。


## 使用方法

```javascript
const target = {
  message1: "hello",
  message2: "everyone",
};

const handler = {
    get(target, prop, receiver){
        return '不告诉你'
    }
};

const proxy = new Proxy(target, handler);


console.log(proxy.message1) // 不告诉你
```

```javascript
const target = {
  message1: "hello",
  message2: "everyone",
};

const handler = {
    get(target, prop, receiver){
        console.log('target: ',target)
        console.log('prop: ', prop)
        console.log('receiver: ', receiver)
        console.log('receiver是target吗？', target === receiver)
        return Reflect.get(target, prop, receiver)
    }
};

const proxy = new Proxy(target, handler);


console.log(proxy.message1)

/**
target:  { message1: 'hello', message2: 'everyone' }
prop:  message1
receiver:  { message1: 'hello', message2: 'everyone' }
receiver是target吗？ false
hello
 */
```
target是被代理的那个对象，prop是要访问的属性名，receiver是访问者。通常是proxy。

输出是receiver和target长得一样，让你觉得proxy和target一样。但是他们**不是同一个东西**

这里我们提供了get（）处理程序的实现，它拦截了访问目标属性的尝试。

## 一个注意点
其实，上面的例子有一个小点没有说，返回的时候不能使用target[prop]，要使用reflect。若直接target[prop]的话，在target里面访问函数时，this不是代理者，而是target。这可能会出现一些问题。下列代码提供解释：
```javascript
const obj = {
  firstName: "张",
  lastName: "三",

  get fullName() {
    console.log("getter 执行, this是obj吗? ", this === obj);
    return this.firstName + this.lastName;
  }
};

const proxy = new Proxy(obj, {
  get(target, prop,receiver) {
    console.log("检测到读取：", prop);
    return Reflect.get(target, prop, receiver);
  }
});

console.log(proxy.fullName);

/**
检测到读取： fullName
getter 执行, this是obj吗?  false
检测到读取： firstName
检测到读取： lastName
张三

 */
```
上面的代码，执行get fullName时，this里面依旧是proxy，会递归触发proxy.firstName以及proxy.lastName。这是我们想要的。如果不使用Reflect.get，而是target[prop]的话。。。
```javascript
const obj = {
  firstName: "张",
  lastName: "三",

  get fullName() {
    console.log("getter 执行, this是obj吗? ", this === obj);
    return this.firstName + this.lastName;
  }
};

const proxy = new Proxy(obj, {
  get(target, key,receiver) {
    console.log("检测到读取：", key);
    return target[prop]
  }
});

console.log(proxy.fullName);

/**
检测到读取： fullName
getter 执行, this是obj吗?  true
张三

 */
```
上面的代码说明，读取firstName与lastName时**直接绕过了Proxy**，这不是我们想要的！所以要使用Reflect。

## handler 还有哪些方法？

handler 对象共支持 **13 个捕获器（trap）**，可以拦截几乎所有对目标对象的操作：

### 属性读写

- **`get(target, prop, receiver)`** — 拦截属性读取
- **`set(target, prop, value, receiver)`** — 拦截属性设置，必须返回 `true`/`false` 表示成功或失败

### 属性存在与删除

- **`has(target, prop)`** — 拦截 `prop in target` 操作符
- **`deleteProperty(target, prop)`** — 拦截 `delete target[prop]` 操作

### 函数相关

- **`apply(target, thisArg, argumentsList)`** — 拦截函数调用 `target(...args)`，注意 target 必须是函数
- **`construct(target, argumentsList, newTarget)`** — 拦截 `new target(...args)` 操作

### 原型相关

- **`getPrototypeOf(target)`** — 拦截 `Object.getPrototypeOf(target)` / `__proto__`
- **`setPrototypeOf(target, proto)`** — 拦截 `Object.setPrototypeOf(target, proto)`

### 属性描述符

- **`getOwnPropertyDescriptor(target, prop)`** — 拦截 `Object.getOwnPropertyDescriptor(target, prop)`
- **`defineProperty(target, prop, descriptor)`** — 拦截 `Object.defineProperty(target, prop, descriptor)`

### 扩展性

- **`isExtensible(target)`** — 拦截 `Object.isExtensible(target)`
- **`preventExtensions(target)`** — 拦截 `Object.preventExtensions(target)`

### 键遍历

- **`ownKeys(target)`** — 拦截以下所有操作：
  - `Object.getOwnPropertyNames()`
  - `Object.getOwnPropertySymbols()`
  - `Object.keys()`
  - `Reflect.ownKeys()`

---

其中最常用的是 `get`、`set`、`has`、`deleteProperty`、`apply`、`construct` 这 6 个。
