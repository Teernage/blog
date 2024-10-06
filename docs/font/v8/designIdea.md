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

<span style='color:red'>V8</span> 内部为函数对象添加了两个隐藏属性：<span style='color:red'>name</span>，<span style='color:red'>code</span>：

- <span style='color:red'>name</span> 为函数名

如果是匿名函数，<span style='color:red'>name</span> 为 <span style='color:red'>anonymous</span>

- <span style='color:red'>code</span> 为函数代码，以字符串的形式存储在内存中

<img src="/img/v8/name和code两个隐藏属性.webp" alt="name和code两个隐藏属性"  />

当执行到一个函数调用语句时，<span style='color:red'>V8</span> 从函数对象中取出 <span style='color:red'>code</span>属性值，然后解释执行这段函数代码

什么是闭包：<span style='font-weight:bold'>将外部变量和函数绑定起来的技术</span>

参考资料：https://v8.dev/blog/react-cliff