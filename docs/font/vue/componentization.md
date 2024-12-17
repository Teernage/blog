# 组件化

组件对象要渲染的内容在 render 方法里，render 方法返回虚拟 dom 给 renderer 渲染器进行渲染

#### 执行组件对象的 data 方法需要做什么操作？

执行组件对象 data 方法，data 返回值用 reactive 包裹，这样数据就是响应式的了，组件对象中的 render 方法中返回的虚拟 dom 如果要通过 this.来访问组件对象中的 data 数据，那就需要在执行组件对象的 render 方法的时候 this 指向改为 reactive 包裹的 data 数据对象

#### 组件是如何实现自身响应式更新的？如何避免频繁更新组件？

组件是通过 render 函数来进行渲染的，所以在给调用 render 函数的区域套上一个 effect 副作用函数即可实现响应式监听，effect 一执行，里面读取响应式数据后，当前的副作用函数就会被依赖收集起来，后续响应式数据更新即会再次执行当前 effect 副作用函数

```js
function mountComponent(vnode, container, anchor) {
  const componentOptions = vnode.type;
  const { render, data } = componentOptions;
  const state = reactive(data());

  /**  instance.update是effect函数的返回值，其实就是副作用回调() => {
      const subTree = render.call(state, state)
       patch(null, subTree, container, anchor)
     } */
  instance.update = effect(
    () => {
      const subTree = render.call(state, state);
      patch(null, subTree, container, anchor);
    },
    {
      // 指定该副作用函数的调度器为 queueJob 即可
      scheduler: queueJobs(instance.update),
    }
  );
}
```

当响应式变量发生了变化，不会再立即执行 effect 中的内容，而是直接执行 scheduler 调度器函数,这个调度器函数是 queueJob，如果当前宏任务中变量更新了 n 次，那么当前的 effect 回调会被添加到 set 集合 n 次，又因为集合有去重能力，所以只有一次，如下代码 queueFlush 方法只有在当前栈没清空前只会执行一遍(即当前宏任务执行完成前)，等到栈清空了，当前宏任务结束之前需要清空微任务队列，此时执行 p.then 的内容执行 set 集合模拟的这个队列中收集的 effect 回调，这样就解决了多次更新响应式变量频繁触发组件更新的问题

```js
// 任务缓存队列，用一个 Set 数据结构来表示，这样就可以自动对任务进行去重
const queue = new Set();
// 一个标志，代表是否正在刷新任务队列
let isFlushing = false;
// 创建一个立即 resolve 的 Promise 实例
const p = Promise.resolve();

export function queueJobs(job) {
  if (!queue.includes(job)) {
    queue.push(job);
  }
  queueFlush();
}

function queueFlush() {
  if (isFlushPending) return;
  isFlushPending = true;
  // 建立微任务 等到当前宏任务执行完毕之前执行
  nextTick(flushJob);
}

/**
 * nextTick 在当前宏任务结束之前执行，视图更新也是微任务也是在当前宏任务之前执行，所以在nextTick的fn回调中可以
 * 获取到最新的组件实例
 * @param fn 回调
 */
export function nextTick(fn) {
  return fn ? p.then(fn) : p;
}
```

本质上利用了微任务的异步执行机制，实现对副作用函数的缓冲。其中 queueJob 函数是调度器最主要的函数，用来将一个任务或副作用函数添加到缓冲队列中，并开始刷新队列。有了 queueJob 函数之后，我们可以在创建渲染副作用时使用它，当响应式数据发生变化时，副作用函数不会立即同步执行，而是会被 queueJob 函数调度，最后在一个微任务中执行

```vue
<template>
  <div>{{ count }}</div>
</template>
<script setup>
const count = ref(0);
for (let i = 0; i < 100; i++) {
  count.value++;
}
</script>
```

如上例子不会频繁更新，因为每次更新都会将 effect 副作用函数添加到微任务队列中，等到当前宏任务执行完成前才会清空微任务队列，这样就不会频繁触发组件更新

### nextTick 原理

上面代码中出现 nextTick 函数，nextTick 是 vue3 中提供的一个工具方法，用于将回调延迟到下一个 DOM 更新周期之后执行。它的实现原理是利用了浏览器的事件循环机制，我们来详细了解一下 nextTick 的实现原理

在 vue 中，当我们需要操作 dom 时，那就需要在 dom 挂载之后才能去操作，通常我们只要使用 nextTick，在 nextTick 的回调中必定可以拿到挂载后的 dom，vue 内部是如何做的呢？

要了解这个原理必须要了解 js 中的宏任务和微任务的概念

举例：

```js
<script>
function a(){
   console.log('我是函数a，我来了')
}

function b(){
   console.log('我是函数b，我来了')
}

function c(){
   console.log('我是函数c，我来了')
}

setTimeout(() => {
   b()
})

Promise.resolve().then(() => {
    c()
});

a()
</script>

// 执行结果：
我是函数a，我来了
我是函数c，我来了
我是函数b，我来了

```

#### 为什么 b 最后执行？

这是因为 setTimeout 是一个宏任务（Macro Task）。当代码执行到 setTimeout 时，它会将任务添加到宏任务队列中，等到当前执行栈中的所有同步代码执行完毕后，才会从宏任务队列中取出任务执行。因此，b 的执行被延后到最后。

#### 为什么 a 先执行，而 c 后执行？

- a 是普通的同步代码，直接在当前执行栈中执行，因此最先输出“我是函数 a，我来了”。
- `Promise.resolve().then(() => { c(); })`是一个微任务（Micro Task）。微任务的执行时机是在当前宏任务（即整个`<script></>`代码块）执行完毕后、进入下一个宏任务之前。所以，c 的执行紧接着同步代码完成后进行。

当代码执行到第 23 行时，js 事件循环机制如下图所示
