# diff 算法

#### vue3 在 template 模版下支持多个根元素，是如何做到的？

vue3 是使用 Fragment 节点将 template 模板下的多个根节点包裹起来，所以这样的话 template 模板下面就只有一个根元素，那就 Fragment，然后再 vue 内部渲染的时候只会渲染 Fragment 的 children 内容，因为 Fragment 本身不会渲染任何真实 dom 内容，只是起了一个包裹的作用，只有其包裹内容即 children 才是真正要渲染的

## 虚拟 DOM 的 diff 算法

diff 算法主要是在 patchChildren 函数中实现的，用于比对和更新新旧虚拟节点的子节点集合（即节点 children 内容），而对节点自身的比对主要是进行属性(props)的简单更新，这种属性更新不需要复杂的 diff 算法，只需要遍历对比新旧属性值即可。

```javaScript
// 伪代码示例
function patch(n1, n2) {
    // n1: 旧节点, n2: 新节点

    // 比对节点类型
    if (n1.type !== n2.type) {
        // 节点类型不同，直接替换
        replaceElement(n1, n2);
        return;
    }

    // 比对节点属性
    patchProps(n1.el, n1.props, n2.props);

    // 然后才进入子节点比对
    patchChildren(n1, n2);
}
```

#### 新旧节点的子节点更新有几种情况？

九种情况

<img src="/img/vue/新旧节点比对的各种情况.webp" width=400 alt="新旧节点比对的各种情况"  />

若新节点没有子节点：

1. 若旧节点也没有子节点：不更新。
2. 若旧节点是文本子节点：清空旧节点的文本。
3. 若旧节点是一组子节点：移除旧节点对应的 DOM 内容。

若新节点是文本子节点：

4. 若旧节点没有子节点：将新节点的文本内容插入 DOM。
5. 若旧节点是文本子节点：更新为新节点的文本内容。
6. 若旧节点是一组子节点：移除旧节点对应的 DOM 内容，并将新节点的文本内容插入 DOM。

若新节点是一组子节点：

7. 若旧节点没有子节点：创建新节点的子节点内容，并插入 DOM。
8. 若旧节点是文本子节点：清空旧节点的文本内容，创建新节点的子节点内容，并插入 DOM。
9. <span style='color:red'>若旧节点也是一组子节点：此时需要引入 diff 算法，进行逐一对比并更新 DOM。</span>
