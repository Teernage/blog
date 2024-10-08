# 编译流水线

##

1.  <span style='color:red'>V8</span> 如何提升 <span style='color:red'>JavaScript</span>执行速度

- 早期缓存机器码，之后重构为缓存字节码

2. 在 <span style='color:red'>JavaScript</span>中访问一个属性时，V8 做了哪些优化

- 隐藏类
- 内联缓存

## 运行时环境：运行 JavaScript 代码的基石

运行时环境包括：堆空间和栈空间、全局执行上下文、全局作用域、内置的内建函数、宿主环境提供的扩展函数和对象，还有消息循环系统

<img src="/img/v8/运行时环境.webp" alt="运行时环境"  />

## 宿主

<img src="/img/v8/宿主环境.webp" alt="宿主环境"  />
v8的宿主环境可以是浏览器，也可以是 node 环境

浏览器为 <span style='color:red'>V8</span> 提供基础的消息循环系统、全局变量、<span style='color:red'>Web API</span>

<span style='color:red'>V8</span>的核心是实现<span style='color:red'>ECMAScript</span>标准，比如：<span style='color:red'>Object</span>、<span style='color:red'>Function</span>、<span style='color:red'>String</span>，还提供垃圾回收、协程等

## 构造数据存储空间：堆空间和栈空间

在<span style='color:red'>Chrome</span>中，只要打开一个渲染进程，渲染进程便会初始化<span style='color:red'>V8</span>，同时初始化堆空间和栈空间。

栈是内存中连续的一块空间，采用“先进后出”的策略。

在函数调用过程中，涉及到上下文相关的内容都会存放在栈上，比如原生类型、引用的对象的地址、函数的执行状态、<span style='color:red'>this</span>值等都会存在栈上

当一个函数执行结束，那么该函数的执行上下文便会被销毁掉。

堆空间是一种树形的存储结构，用来存储对象类型的离散的数据，比如：函数、数组，在浏览器中还有<span style='color:red'>window</span>、<span style='color:red'>document</span>等

## 全局执行上下文和全局作用域

<img src="/img/v8/执行上下文.webp" alt="执行上下文"  />

执行上下文中主要包含三部分，变量环境、词法环境和<span style='color:red'>this</span>关键字

全局执行上下文在<span style='color:red'>V8</span>的生存周期内是不会被销毁的，它会一直保存在堆中

在<span style='color:red'>ES6</span>中，同一个全局执行上下文中，都能存在多个作用域：

```javascript
var x = 5;
{
  let y = 2;
  const z = 3;
}
```

<img src="/img/v8/作用域.webp" alt="作用域" width=300  />

当 V8 调用了一个函数时，就会进入函数的执行上下文，这时候全局执行上下文和当前的函数执行上下文就形成了一个栈结构。比如执行下面这段代码：

```javascript
var x = 1;
function show_x() {
  console.log(x);
}
function bar() {
  show_x();
}
bar();
```

当执行到 show_x 的时候，其栈状态如下图所示：
<img src="/img/v8/函数调用栈.webp" alt="函数调用栈" width=300  />

## 构造事件循环系统

<img src="/img/v8/事件循环系统.webp" alt="事件循环系统"  />

<span style='color:red'>V8</span>需要一个主线程，用来执行<span style='color:red'>JavaScript</span>和执行垃圾回收等工作

<span style='color:red'>V8</span>是寄生在宿主环境中的,<span style='color:red'>V8</span>所执行的代码都是在宿主的主线程上执行的

如果主线程正在执行一个任务，这时候又来了一个新任务，把新任务放到消息队列中，等待当前任务执行结束后，再从消息队列中取出正在排列的任务，执行完这个任务之后，再重复这个过程

## 机器代码：二进制机器码究竟是如何被 CPU 执行的？

<img src="/img/v8/二进制机器码执行流程.webp" alt="二进制机器码执行流程"  />

<img src="/img/v8/js编译流程图.webp" alt="js编译流程图"  />

<img src="/img/v8/计算机系统的硬件组织结构.webp" alt="计算机系统的硬件组织结构"  />

将汇编语言转换为机器语言的过程称为“汇编”；反之，机器语言转化为汇编语言的过程称为“反汇编”

在程序执行之前，需要将程序装进内存中（内存中的每个存储空间都有独一无二的地址）
<img src="/img/v8/内存地址.webp" alt="内存地址" width=350 />

二进制代码被装载进内存后，<span style='color:red'>CPU</span>便可以从内存中取出一条指令，然后分析该指令，最后执行该指令。

把取出指令、分析指令、执行指令这三个过程称为一个<span style='color:red'>CPU</span>时钟周期

<span style='color:red'>CPU</span>中有一个<span style='color:red'>PC</span>寄存器，它保存了将要执行的指令地址，到下一个时钟周期时,<span style='color:red'>CPU</span>便会根据<span style='color:red'>PC</span>寄存器中的地址，从内存中取出指令。

<img src="/img/v8/pc寄存器读取.webp" alt="pc寄存器读取" />

<span style='color:red'>PC</span>寄存器中的指令取出来之后，系统要做<span style='font-weight:bold'>两件事</span>：

<div style='font-weight:bold'>1. 将下一条指令的地址更新到<span style='color:red'>PC</span>寄存器中</div>

比如上图中，CPU 将第一个指令 55 取出来之后，系统会立即将下一个指令的地址填写到 PC 寄存器中，上个寄存器的地址是 100000f90，那么下一条指令的地址就是 100000f91 了，如下图所示：
<img src="/img/v8/pc寄存器读取2.webp" alt="pc寄存器读取2.webp" />

<div style='font-weight:bold'>2. 分析该指令，识别出不同类型的指令，以及各种获取操作数的方法</div>

因为<span style='color:red'>CPU</span>访问内存的速度很慢，所以需要通用寄存器，用来存放<span style='color:red'>CPU</span>中数据的（通用寄存器容量小，读写速度快，内存容量大，读写速度慢。）

- <span style='color:red'>通用</span>寄存器通常用来存放数据或者内存中某块数据的地址，我们把这个地址又称为指针(指针是指向内存中某个位置的变量，可以用来访问和操作存储在该位置的数据)
- <span style='color:red'>ebp</span>寄存器通常是用来存放栈帧指针
- <span style='color:red'>esp</span>寄存器用来存放栈顶指针
- <span style='color:red'>PC</span>寄存器用来存放下一条要执行的指令

常用的指令类型：

1. <span style='font-weight:bold'>加载指令</span>：从内存中复制指定长度的内容到通用寄存器中，并覆盖寄存器中原来的内容

<img src="/img/v8/更新PC寄存器.webp" alt="更新PC寄存器.webp" />
比如上图使用了 movl 指令，指令后面跟着的第一个参数是要拷贝数据的内存的位置，第二个参数是要拷贝到 ecx 这个寄存器

2. <span style='font-weight:bold'>存储指令</span>：和加载类型的指令相反，作用是将寄存器中的内容复制到内存中的某个位置，并覆盖掉内存中的这个位置上原来的内容
   <img src="/img/v8/更新PC寄存器2.webp" alt="更新PC寄存器2.webp" />
   上图也是使用 movl 指令，movl 指令后面的 %ecx 就是寄存器地址，-8(%rbp) 是内存中的地址，这条指令的作用是将寄存器中的值拷贝到内存中。
3. <span style='font-weight:bold'>更新指令</span>：其作用是复制两个寄存器中的内容到 ALU 中，也可以是一块寄存器和一块内存中的内容到 ALU 中，ALU 将两个字相加，并将结果存放在其中的一个寄存器中，并覆盖该寄存器中的内容。具体流程如下图所示：
   <img src="/img/v8/更新指令.webp" alt="更新指令.webp" />
   参看上图，我们可以发现 addl 指令，将寄存器 eax 和 ecx 中的值传给 ALU，ALU 对它们进行相加操纵，并将计算的结果写回 ecx。

4. <span style='font-weight:bold'>跳转指令</span>：从指令本身抽取出一个字，这个字是下一条要执行的指令地址，并将该字复制到 <span style='color:red'>PC</span>寄存器中，并覆盖掉<span style='color:red'>PC</span>寄存器中原来的值
   <img src="/img/v8/跳转指令.webp" alt="跳转指令.webp" />
   观察上图，上图是通过 jmp 来实现的，jmp 后面跟着要跳转的内存中的指令地址。

除了以上指令之外，还有 IO 读 / 写指令，这些指令可以从一个 IO 设备中复制指定长度的数据到寄存器中，也可以将一个寄存器中的数据复制到指定的 IO 设备。

<span style='color:red'>IO 读 / 写指令例子</span>：
假设你有一台电脑,里面有一个 USB 接口,你想把一个 U 盘插到这个 USB 接口上。

从 U 盘<span style='color:red'>读取</span>数据到寄存器:

相当于你把手伸进 U 盘,抓取里面的某个文件或数据,放到你手上(寄存器)。
对应的 CPU 指令是: IN AL, 0x3F8，将 U 盘地址 0x3F8 处的 1 个字节数据读取到寄存器 AL 中。

将寄存器中的数据<span style='color:red'>写入</span>U 盘:

相当于你把手上(寄存器)拿着的某个文件或数据,放回到 U 盘里。
对应的 CPU 指令是: OUT 0x3F8, AL，将寄存器 AL 中的 1 个字节数据写入到 U 盘地址 0x3F8 处。
通过这种 I/O 读写指令,CPU 就可以与外部的 U 盘设备进行数据交互和传输,就像你用手在 U 盘和手上(寄存器)之间转移数据一样。

这样的 I/O 指令不仅适用于 U 盘,也适用于其他外围设备,如键盘、显示器、打印机等,让 CPU 能够与各种外部设备进行通信和控制。

以上就是一些基础的指令类型，这些指令像积木，利用它们可以搭建我们现在复杂的软件大厦。

### 分析一段汇编代码的执行流程

在 C 程序中，CPU 会首先执行调用 main 函数，在调用 main 函数时，CPU 会保存上个栈帧上下文信息和创建当前栈帧的上下文信息，主要是通过下面这两条指令实现的：

```javascript
pushq   %rbp
movq    %rsp, %rbp
```

第一条指令 pushq %rbp，是将 rbp 寄存器中的值写到内存中的栈区域。第二条指令是将 rsp 寄存器中的值写到 rbp 寄存器中。

然后将 0 写到栈帧的第一个位置，对应的汇编代码如下：

```javascript
movl  $0, -4(%rbp)
```

接下来给 x 和 y 赋值，对应的代码是下面两行：

```javascript
movl  $1, -8(%rbp)
movl  $2, -12(%rbp)
```

第一行指令是将常数值 1 压入到栈中，然后再将常数值 2 压入到栈中，这两个值分别对应着 x 和 y。

接下来，x 的值从栈中复制到 eax 寄存器中，对应的指令如下所示：

```javascript
movl  -8(%rbp), %eax
```

现在 eax 寄存器中保存了 x 的值，那么接下来，再将内存中的 y 和 eax 中的 x 相加，相加的结果再保存在 eax 中，对应的指令如下所示：

```javascript
 movl  %eax, -16(%rbp)
```

最后又将结果 z 加载到 eax 寄存器中，代码如下所示：

```javascript
movl  -16(%rbp), %eax
```

注意这里的 eax 寄存器中的内容就被默认作为返回值了，执行到这里函数基本就执行结束了，然后需要继续执行一些恢复现场的操作，代码如下所示：

```javascript
popq % rbp;
retq;
```

到了这里，我们整个程序就执行结束了。

## 堆和栈：函数调用是如何影响到内存布局的？

### 函数有两个主要的特性：

1. 可以被调用
2. 具有作用域机制

所以：

- 函数调用者的生命周期比被调用者的长（后进），被调用者的生命周期先结束 (先出)
- 从函数资源分配和回收角度来看:
  - 被调用函数的资源分配晚于调用函数 (后进)，
  - 被调用函数资源的释放先于调用函数 (先出)

栈的状态从<span style='color:red'> add </span>中恢复到<span style='color:red'> main </span>函数的上次执行时的状态，这个过程称为<span style='font-weight:bold'>恢复现场</span>。

```javascript
function main() {
  add();
}
function add(num1, num2) {
  return num1 + num2;
}
```

怎么恢复 main 函数的执行现场呢：

1. 在<span style='color:red'>esp</span>寄存器中保存一个永远指向当前栈顶的指针
   告诉你往哪个位置添加新元素
2. <span style='color:red'>ebp</span> 寄存器，保存当前函数的起始位置（也叫<span style='font-weight:bold'>栈帧指针</span>）

- 告诉 <span style='color:red'>CPU</span> 移动到这个地址

栈帧：每个栈帧对应着一个未运行完的函数，栈帧中保存了该函数的返回地址和局部变量。

## 延迟解析：V8 是如何实现闭包的？

在编译阶段，<span style='color:red'>V8</span> 不会对所有代码进行编译，采用一种“惰性编译”或者“惰性解析”，也就是说 V8 默认不会对函数内部的代码进行编译，只有当函数被执行前，才会进行编译。

<span style='color:red'>闭包</span>的问题指的是：由于子函数使用到了父函数的变量，导致父函数在执行完成以后，它内部被子函数引用的变量无法及时在内存中被释放。

而闭包问题产生的根本原因是 <span style='color:red'>JavaScript</span> 中本身的特性：

1. 可以在函数内部定义新的函数
2. 内部函数可以访问父函数的变量
3. 函数是一等公民，所以函数可以作为返回值

既然由于<span style='color:red'>JavaScript</span> 的这种特性就会出现闭包的问题，那么就需要解决闭包问题，“预编译“ 或者 “预解析” 就出现了

预编译具体方案： 在编译阶段，<span style='color:red'>V8</span> 会对函数函数进行预解析

1. 判断函数内语法是否正确
2. 子函数是否引用父函数中的变量，如果有的话，将这个变量复制一份到堆中，同时子函数本身也是一个对象，也会被放到堆中

- 父函数执行完成后，内存会被释放
- 子函数在执行时，依然可以从堆内存中访问复制过来的变量

## 字节码（一）：V8 为什么又重新引入字节码？

<img src="/img/v8/v8虚拟机思维导图.webp" alt="v8虚拟机思维导图"  />

#### 在 V8 中，字节码有两个作用：

1. 解释器可以直接执行字节码
2. 优化编译器可以将字节码编译为机器码，然后再执行机器码

#### 早期的 V8

<img src="/img/v8/早期的v8执行流程图.webp" alt="早期的v8执行流程图"  />

<span style='color:red'>V8</span>团队认为“先生成字节码再执行字节码”，会牺牲代码的执行速度，便直接将<span style='color:red'>JavaScript</span>代码编译成机器码

使用了两个编译器：

1. 基线编译器：将 JavaScript 代码编译为没有优化过的机器码
2. 优化编译器：将一些热点代码（执行频繁的代码）优化为执行效率更高的机器码

执行 <span style='color:red'>JavaScript</span>：

1. 将 <span style='color:red'>JavaScript</span>代码转换为抽象语法树（<span style='color:red'>AST</span>）
2. 基线编译器将<span style='color:red'>AST</span>编译为未优化过的机器码，然后<span style='color:red'>V8</span>执行这些未优化过的机器代码
3. 在执行未优化的机器代码时，将一些热点代码优化为执行效率更高的机器代码，然后执行优化过的机器码
4. 如果优化过的机器码不满足当前代码的执行，<span style='color:red'>V8</span>会进行反优化操作

#### 问题

1.  <span style='font-weight:bold'>机器码缓存</span>

<span style='color:red'>V8</span>执行一段<span style='color:red'>JavaScript</span>代码，编译时间和执行时间差不多

如果再<span style='color:red'>JavaScript</span>没有改变的情况下，每次都编译这段代码，就会浪费<span style='color:red'>CPU</span>资源

所以<span style='color:red'>V8</span>引入机器码缓存：

1. 将源代码编译成机器码后，放在内存中（内存缓存）
2. 下次再执行这段代码，就先去内存中查找是否存在这段代码的机器码，有的话就执行这段机器码
3. 将编译后的机器码存入硬盘中，关闭浏览器后，下次重新打开，可以直接用编译好的机器码

时间缩短了<span style='color:red'>20% ~ 40%</span>

这是用空间换时间的策略，在移动端非常吃内存

2.  <span style='font-weight:bold'>惰性编译</span>

<span style='color:red'>V8</span>采用惰性编译，只会编译全局执行上下文的代码

由于<span style='color:red'>ES6</span>之前，没有块级作用域，为了实现各模块之间的隔离，会采用立即执行函数

这会产生很多闭包，闭包模块中的代码不会被缓存，所以只缓存顶层代码是不完美的

所以<span style='color:red'>V8</span>就进行了大重构

如：

```javascript
(function () {
  // 模块内部的代码
})();
```

这样可以创建一个独立的作用域,避免模块之间的变量污染。

但是,这种做法会产生大量的闭包。闭包是指一个函数能够访问其外部函数作用域中的变量,即使外部函数已经执行完毕。

在上面的例子中,模块内部的代码都是闭包,它们都能访问模块作用域中的变量。

问题在于,V8 引擎在进行代码优化和缓存的时候,只会缓存顶层的代码,而不会缓存闭包中的代码。

也就是说,即使模块中的大部分代码都是相同的,只要有一部分代码被包裹在闭包中,那么这些闭包中的代码就不会被缓存。这就导致了性能的下降。

#### 现在的 V8

字节码 + 解释器 + 编译器

```text
5K 的源代码 JavaScript -> 40K 字节码 -> 10M 的机器码
```

字节码的体积远小于机器码，浏览器就可以实现缓存所有的字节码，而不仅仅是全局执行上下文的字节码

##### 优点：

1. 降低了内存
2. 提升代码启动速度
3. 降低了代码的复杂度

##### 缺点：

1.  执行效率下降

    解释器的作用是将源代码转换成字节码

<span style='color:red'>V8</span> 的解释器是：<span style='color:red'>lgnition</span>；<span style='color:red'>V8</span> 的编译器是：<span style='color:red'>TurboFan</span>

#### 如何降低代码复杂度

<img src="/img/v8/源代码转成二进制.webp" alt="源代码转成二进制"  />

机器码在不同的<span style='color:red'> CPU </span> 架构中是各不相同的。直接将抽象语法树（<span style='color:red'>AST</span>）转换为特定的机器码，意味着基线编译器和优化编译器需要为每种<span style='color:red'> CPU </span> 编写大量适配代码。早期的 V8 引擎采用了直接编译成机器码的策略，并使用内存缓存和硬盘存储，这导致在不同设备和 <span style='color:red'> CPU </span> 上生成的机器码存在差异

所以 v8 采用先将<span style='color:red'>AST</span>转换成字节码，再将字节码转换成机器码，由于字节码（消除了平台的差异性）和 <span style='color:red'> CPU </span> 执行机器码过程类似，将字节码转换成机器码就会容易很多
<img src="/img/v8/源码转字节码转二进制.webp" alt="源码转字节码转二进制"  />

小结：

早期的 V8 为了提升代码的执行速度，直接将 JavaScript 源代码编译成了没有优化的二进制的机器代码，如果某一段二进制代码执行频率过高，那么 V8 会将其标记为热点代码，热点代码会被优化编译器优化，优化后的机器代码执行效率更高。

不过随着移动设备的普及，V8 团队逐渐发现将 JavaScript 源码直接编译成二进制代码存在两个致命的问题：

- 时间问题：编译时间过久，影响代码启动速度；
- 空间问题：缓存编译后的二进制代码占用更多的内存。

这两个问题无疑会阻碍 V8 在移动设备上的普及，于是 V8 团队大规模重构代码，引入了中间的字节码。字节码的优势有如下三点：

- 解决启动问题：生成字节码的时间很短；
- 解决空间问题：字节码占用内存不多，缓存字节码会大大降低内存的使用；
- 代码架构清晰：采用字节码，可以简化程序的复杂度，使得 V8 移植到不同的 CPU 架构平台更加容易。

## 字节码（二）：解释器是如何解释执行字节码的？

<img src="/img/v8/字节码解释器工作流程.webp" alt="字节码解释器工作流程"  />

字节码的解释执行在编译流水线中的位置如下图：
<img src="/img/v8/编译流水线图之解释执行.webp" alt="编译流水线图之解释执行"  />

### 生成字节码

```javascript
function add(x, y) {
  var z = x + y;
  return z;
}
console.log(add(1, 2));
```

#### 生成 AST

```ast
[generating bytecode for function: add]
--- AST ---
FUNC at 12
  KIND 0
  LITERAL ID 1
  SUSPEND COUNT 0
  NAME "add"
  PARAMS
    VAR (0x7fa7bf8048e8) (mode = VAR, assigned = false) "x"
    VAR (0x7fa7bf804990) (mode = VAR, assigned = false) "y"
  DECLS
    VARIABLE (0x7fa7bf8048e8) (mode = VAR, assigned = false) "x"
    VARIABLE (0x7fa7bf804990) (mode = VAR, assigned = false) "y"
    VARIABLE (0x7fa7bf804a38) (mode = VAR, assigned = false) "z"
  BLOCK NOCOMPLETIONS at -1
    EXPRESSION STATEMENT at 31
      INIT at 31
        VAR PROXY local[0] (0x7fa7bf804a38) (mode = VAR, assigned = false) "z"
        ADD at 32
          VAR PROXY parameter[0] (0x7fa7bf8048e8) (mode = VAR, assigned = false) "x"
          VAR PROXY parameter[1] (0x7fa7bf804990) (mode = VAR, assigned = false) "y"
  RETURN at 37
    VAR PROXY local[0] (0x7fa7bf804a38) (mode = VAR, assigned = false) "z"

```

将 <span style='color:red'>AST</span> 图形化
<img src="/img/v8/ast图形化.webp" alt="ast图形化"  />

将函数拆成了 4 部分

1. 参数声明（<span style='color:red'>PARAMS</span>）：包括声明中的所有参数，这里是 <span style='color:red'>x</span> 和 <span style='color:red'>y</span>，也可以使用 <span style='color:red'>arguments</span>
2. 变量声明节点（<span style='color:red'>DECLS</span>）：出现了 <span style='color:red'>3</span> 个变量：<span style='color:red'>x</span>、<span style='color:red'>y</span>、<span style='color:red'>z</span>，你会发现 <span style='color:red'>x</span> 和 <span style='color:red'>y</span> 的地址和 <span style='color:red'>PARAMS</span> 中是相同的，说明他们是同一块数据
3. 表达式节点：<span style='color:red'>ADD</span> 节点下有<span style='color:red'> VAR PROXY parameter[0]</span> 和 <span style='color:red'>VAR PROXY parameter[1]</span>
4. <span style='color:red'>RETURN</span> 节点：指向了<span style='color:red'> z</span> 的值，这里是<span style='color:red'> local[0] </span>

生成 AST 的同时，还生成了 add 函数的作用域

```ast
Global scope:
function add (x, y) { // (0x7f9ed7849468) (12, 47)
  // will be compiled
  // 1 stack slots
  // local vars:
  VAR y;  // (0x7f9ed7849790) parameter[1], never assigned
  VAR z;  // (0x7f9ed7849838) local[0], never assigned
  VAR x;  // (0x7f9ed78496e8) parameter[0], never assigned
}
```

在解析阶段，普通变量默认值是 <span style='color:red'>undefined</span>，函数声明指向实际的函数对象；执行阶段，变量会指向栈和堆相应的数据
如下图所示：
<img src="/img/v8/执行.pic.webp" alt="执行.pic"  />

<span style='color:red'>AST</span> 作为输入传到自己字节码生成器中（<span style='color:red'>BytecodeGenerator</span>），它是 <span style='color:red'>lgnition</span> 的一部分，生成以函数为单位的字节码

```ast
[generated bytecode for function: add (0x079e0824fdc1 <SharedFunctionInfo add>)]
Parameter count 3
Register count 2
Frame size 16
         0x79e0824ff7a @    0 : a7                StackCheck
         0x79e0824ff7b @    1 : 25 02             Ldar a1
         0x79e0824ff7d @    3 : 34 03 00          Add a0, [0]
         0x79e0824ff80 @    6 : 26 fb             Star r0
         0x79e0824ff82 @    8 : 0c 02             LdaSmi [2]
         0x79e0824ff84 @   10 : 26 fa             Star r1
         0x79e0824ff86 @   12 : 25 fb             Ldar r0
         0x79e0824ff88 @   14 : ab                Return
Constant pool (size = 0)
Handler Table (size = 0)
Source Position Table (size = 0)
```

这里 <span style='color:red'>Parameter count 3 </span>表示显示的参数<span style='color:red'> x </span>和 <span style='color:red'> y </span>，及隐式参数 <span style='color:red'>this</span>

最终的字节码

```text
StackCheck
Ldar a1
Add a0, [0]
Star r0
LdaSmi [2]
Star r1
Ldar r0
Return
```
