# 编译优化

<img src="/img/vue/编译优化.webp" alt="编译优化"  />

编译优化是指编译器将模版编译为渲染函数的过程，优化的方向是尽可能地区分动态内容和静态内容，并针对不同的内容采取不同的优化策略

#### 为什么传统的 diff 算法无法避免新旧虚拟 dom 节点无用的比较操作？

因为它在运行时得不到足够的关键信息，从而无法区分动态内容和静态内容，所以当响应式数据发生改变时，会生成一颗新的虚拟 DOM 树，再跟旧的虚拟 dom 树逐一进行比较和更新，这样效率不不高，为此 vue3 作了编译优化，跳过了无意义的 diff 操作，大幅提升性能

#### vue3 是用什么来描述动态节点的？

用 patchFlag 来标记虚拟 dom 节点，只要存在该属性的 vnode，都认为是一个动态节点

#### vue3 中的 Block 块指的是什么？

我们把 vnode 虚拟节点带有 dynamicChildren 属性的节点称为“块”，即 Block。所以，一个 Block 本质上也是一个虚拟 dom 节点，只不过它比普通的虚拟节点多出来一个用来存储动态子节点的 dynamicChildren 属性。

```js
const vnode = {
  tag: 'div',
  children: [
    { tag: 'div', children: 'foo' },
    { tag: 'p', children: ctx.bar, patchFlag: PatchFlags.TEXT }, // 这是动态节点
  ],
  // 将 children 中的动态节点提取到 dynamicChildren 数组中
  dynamicChildren: [
    // p 标签具有 patchFlag 属性，因此它是动态节点
    { tag: 'p', children: ctx.bar, patchFlag: PatchFlags.TEXT },
  ],
};
```

在 Vue 3 中，所有模板的根节点都会被编译为一个 Block 节点。任何包含 v-for、v-if/v-else-if/v-else 等条件性或迭代指令的节点也会被封装为 Block 节点。这是因为这些指令会导致节点及其子树根据数据的变化而动态生成或更新，因此其结构和内容是不确定的。

#### vue3 如何收集动态节点进入 dynamicChildren 的？

在渲染函数内，对 createVNode 函数的调用是层层的嵌套结构，并且该函数的执行顺序是“内层先执行，外层后执行”

<img src="/img/vue/vnode的dynamicChildren属性.webp" alt="vnode的dynamicChildren属性"  />

当外层 createVNode 函数执行时，内层的 createVNode 函数已经执行完毕了。因此，为了让外层 Block 节点能够收集到内层动态节点，就需要一个栈结构的数据来临时存储内层的动态节点
以下代码中的 dynamicChildrenStack 就是来收集动态虚拟节点的

```js
//动态节点栈
const dynamicChildrenStack = [];
// 当前动态节点集合
let currentDynamicChildren = null;
// openBlock 用来创建一个新的动态节点集合，并将该集合压入栈中
function openBlock() {
  dynamicChildrenStack.push((currentDynamicChildren = []));
}
// closeBlock 用来将通过 openBlock 创建的动态节点集合从栈中弹出
function closeBlock() {
  currentDynamicChildren = dynamicChildrenStack.pop();
}
```

当使用 createVnode 来生成虚拟节点时，判断当前虚拟节点是否有 patchFlags 属性，如果有则将当前虚拟节点存储到 currentDynamicChildren 栈中

```js
function createVNode(tag, props, children, flags){
    const key = props && props.keyprops && delete props.key
    const vnode ={
        tag，
        props,
        children,
        key,
        patchFlags: flags
      }
    if (typeof flags !=='undefined'&& currentDynamicChildren){
       //动态节点，将其添加到当前动态节点集合中
         currentDynamicChildren.push(vnode)
      }
    return vnode
  }
```

根节点是 Block 节点

```js
render(){
//1.使用 createBlock 代替 createVNode 来创建 block
//2.每当调用 createBlock 之前，先调用 openBlock
return(
  openBlock(),
  createBlock('div', null,
  [
    createVNode('p',{class:'foo'},null, 1 /* patch flag */),
    createVNode('p',{ class:'bar'},null),
  ]
 ))
}
```

以下是 Block 节点的创建，根普通的虚拟的创建唯一的不同就是多了给虚拟节点添加 dynamicChildren 属性，将所有的动态子节点都会赋值给 dynamicChildren 属性

```js
function createBlock(tag, props, children) {
  //block 本质上也是一个 vnode
  const block = createVNode(tag, props, children);
  //将当前动态节点集合作为
  block.dynamicChildrenblock.dynamicChildren = currentDynamicChildren;
  // 关闭 block
  closeBlock();
  //返回
  return block;
}
```

由于 createVNode 函数和 createBlock 函数的执行顺序是从内向外，所以当 createBlock 函数执行时，内层的所有 createVNode 函数已经执行完毕了。这时，currentDynamicChildren 数组中所存储的就是属于当前 Block 的所有动态子代节点。因此，我们只需要将 currentDynamicChildren 数组作为 block.dynamicChildren 属性的值即可。这样，我们就完成了动态节点的收集。

当我们在比对新旧虚拟节点的时候，如果新虚拟节点有 dynamicChildren 属性，直接拿新旧虚拟节点的 dynamicChildren 动态节点集合进行比对并更新，这样就减少了静态节点的无意义比对

```js
function patchElement(n1,n2){
const el= n2.el = n1.el
const oldProps = n1.props
const newProps = n2.props

    //省略部分代码
  if(n2.dynamicChildren){
    //调用 patchBlockChildren 函数，这样只会更新动态节点
    patchBlockChildren(n1,n2)
  } else {
    patchChildren(n1,n2, el)
  }

 function patchBlockChildren(n1，n2){
         //只更新动态节点即可
    for(let i=0;i<n2.dynamicChildren.length; i++){
          patchElement(n1.dynamicChildren[i],n2.dynamicChildren[i])
     }
  }
}
```
