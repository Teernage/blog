# 设计思想

## 如何学习谷歌高性能 JavaScript 引擎 V8？

### <span style='color:red'>V8</span> 主要涉及三个技术：编译流水线、事件循环系统、垃圾回收机制

### 1. <span style='color:red'>V8</span> 执行 <span style='color:red'>JavaScript</span> 完整流程称为：<span style='font-weight:bold'>编译流水线</span>

<img src="/img/v8/V8执行一段JavaScript流程图.webp" alt="V8执行一段JavaScript流程图"  />

#### 编译流水线涉及到的技术有：

#### JIT

- <span style='color:red'>V8</span> 混合编译执行和解释执行

#### 惰性解析

- 加快代码启动速度

#### 隐藏类(<span style='color:red'>Hide Class</span>)

- 将动态类型转为静态类型，消除动态类型执行速度慢的问题

#### 内联缓存

### 2. 事件循环系统

- <span style='color:red'>JavaScript</span> 中的难点：异步编程
- 调度排队任务，让 <span style='color:red'>JavaScript</span> 有序的执行

### 3. 垃圾回收机制

- 内存分配
- 内存回收

## V8 是如何执行一段 JavaScript 代码的？

#### 1. 准备基础环境：

- 全局执行上下文：全局作用、全局变量、内置函数
- 初始化内存中的堆和栈结构
- 初始化消息循环系统：消息驱动器和消息队列

#### 2. 结构化<span style='color:red'>JavaScript</span>源代码

- 生成抽象语法树（<span style='color:red'>AST</span>）
- 生成相关作用域

#### 3. 生成字节码：字节码是介于 <span style='color:red'>AST</span> 和机器码的中间代码

- 解释器可以直接执行
- 编译器需要将其编译为二进制的机器码再执行

#### 4. 解释器和监控机器人

- 解释器：按照顺序执行字节码，并输出执行结果
- 监控机器人：如果发现某段代码被重复多次执行，将其标记为热点代码

#### 5. 优化热点代码

- 优化编译器将热点代码编译为机器码
- 对编译后的机器码进行优化
- 再次执行到这段代码时，将优先执行优化后的代码

#### 6. 反优化

- <span style='color:red'>JavaScript</span> 对象在运行时可能会被改变，这段优化后的热点代码就失效了
- 进行反优化操作，给到解释器解释执行

## 函数即对象

函数是 js 中一等公民，因为函数可以赋值(赋值给变量)，可以作为参数传递，可以作为返回值，函数可以拥有属性和方法

<span style='color:red'>V8</span> 内部为函数对象添加了两个隐藏属性：<span style='color:red'>name</span>，<span style='color:red'>code</span>：

- <span style='color:red'>name</span> 为函数名

如果是匿名函数，<span style='color:red'>name</span> 为 <span style='color:red'>anonymous</span>

- <span style='color:red'>code</span> 为函数代码，以字符串的形式存储在内存中

<img src="/img/v8/name和code两个隐藏属性.webp" alt="name和code两个隐藏属性"  />

当执行到一个函数调用语句时，<span style='color:red'>V8</span> 从函数对象中取出 <span style='color:red'>code</span>属性值，然后解释执行这段函数代码

什么是闭包：<span style='font-weight:bold'>将外部变量和函数绑定起来的技术</span>

参考资料：https://v8.dev/blog/react-cliff

## 快属性和慢属性：V8 是怎样提升对象属性访问速度的？

<span style='color:red'>V8</span> 在实现对象存储时，没有完全采用字典的存储方式，因为字典是非线性的数据结构，查询效率会低于线性的数据结构

### 常规属性和索引属性

- 索引属性（<span style='color:red'>elements</span>）：数字属性按照索引值的大小升序排列
- 常规属性（<span style='color:red'>properties</span>）：字符串根据创建时的顺序升序排列

它们都是线性数据结构，分别为 <span style='color:red'>elements</span> 对象和 <span style='color:red'>properties</span> 对象

执行一次查询：先从 <span style='color:red'>elements</span> 对象中按照顺序读出所有元素，然后再从 <span style='color:red'>properties</span> 对象中读取所有的元素

### 快属性和慢属性

在访问一个属性时，比如：<span style='color:red'>foo.a</span>，<span style='color:red'>V8</span> 先查找出 <span style='color:red'>properties</span>，然后在从 <span style='color:red'>properties</span> 中查找出 <span style='color:red'>a</span> 属性

<span style='color:red'>V8</span>为了简化这一步操作，把部分<span style='color:red'>properties</span>存储到对象本身，默认是 <span style='color:red'>10</span> 个，这个被称为<span style='font-weight:bold'>对象内属性</span>

对象内属性是一种线性数据结构,也就是数组或链表这种结构。这种线性数据结构的属性访问效率较高,通常被称为<span style='color:red'>快属性</span>。

线性数据结构通常被称为<span style='color:red'>快</span>属性

线性数据结构进行大量数据的添加和删除，执行效率是非常低的，所以<span style='color:red'>V8</span>会采用慢属性策略

<span style='color:red'>慢</span>属性的对象内部有独立的非线性数据结构（字典）

总之,V8 通过区分"快属性"和"慢属性"的存储方式,在属性访问效率和动态修改属性之间进行权衡,以提高 JavaScript 代码的整体执行效率。

参考资料：https://v8.dev/blog/fast-properties

## 函数表达式：涉及大量概念，函数表达式到底该怎么学？

### 变量提升

在 <span style='color:red'>js</span> 中有函数声明的方式有两种：

- 函数声明

```javascript
function foo() {
  console.log('foo');
}
```

- 函数表达式

```javascript
var foo = function () {
  console.log('foo');
};
```

在编译阶段 <span style='color:red'>V8</span> 解析到函数声明和函数表达式（变量声明）时：

函数声明，将其转换为内存中的函数对象，并放到作用域中
变量声明，将其值设置为 <span style='color:red'>undefined</span>，并当道作用域中

因为在编译阶段，是不会执行表达式的，只会分析变量的定义、函数的声明
所以如果在声明前调用 <span style='color:red'>foo</span> 函数：

- 使用函数声明不会报错
- 使用函数表达式会报错

在编译阶段将所有的变量提升到作用域的过程称为<span style='font-weight:bold'>变量提升</span>

## 立即执行函数

<span style='color:red'>js</span> 的圆括号 <span style='color:red'>()</span> 可以在中间放一个表达式

中间如果是一个函数声明，<span style='color:red'>V8</span> 就会把<span style='color:red'> (function(){})</span> 看成是函数表达式，执行它会返回一个函数对象

如果在函数表达式后面加上<span style='color:red'>()</span>，就被称为立即调用函数表达式

因为函数立即表达式也是表达式，所以不会创建函数对象，就不会污染环境
