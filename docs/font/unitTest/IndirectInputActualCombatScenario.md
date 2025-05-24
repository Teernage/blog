# 程序间接输入各种场景---第三方库&对象&class&常量

## 测试使用第三方库的代码

调用第三方模块，比如调用了 axios，应该如何测试呢?

例子：

```js
import axios from 'axios';

interface User {
  name: string;
  age: number;
}

export async function doubleUserAge() {
  // 调用了第三方模块
  // const user: User = await axios("/user/1");
  // 对象  让你直接调用对象上的方法
  const user: User = await axios.get('/user/1');
  return user.age * 2;
}
```

测试用例：

```js
import { test, vi, expect } from 'vitest';
import { doubleUserAge } from './third-party-modules';
import axios from 'axios';
import { config } from './config';

vi.mock('axios');

test('第三方模式的处理 axios', async () => {
  // vi.mocked(axios).mockResolvedValue({ name: "xzx", age: 18 });
  vi.mocked(axios.get).mockResolvedValue({ name: 'xzx', age: 18 });

  const r = await doubleUserAge();

  expect(r).toBe(36);
});
```

1. Mocking Axios:

- 使用 vi.mock('axios') 来告诉 vitest mock Axios 库。
- 使用 vi.mocked(axios.get) 来指定 Axios 的 get 方法应该返回一个特定的值。
- 在本例中，我们使用 mockResolvedValueOnce 来确保该 mock 只会在一次调用后生效，这样可以测试多次调用时的行为。

2. 测试逻辑:

- 在测试中，我们首先 mock Axios 的 get 方法，使其返回一个特定的 JSON 对象。
- 然后调用 doubleUserAge 函数，并期望其返回值是用户年龄乘以 2，即 36。

## 测试使用对象的代码

当代码依赖配置对象时，我们可以直接修改对象属性进行测试。

例子：

```js
import { config } from './config';

export function tellAge() {
  if (config.allowTellAge) {
    return 18;
  }

  return '就不告诉你';
}
```

测试用例：

```js
import { it, expect, describe, vi } from 'vitest';
import { tellAge } from './use-object';
import { config } from './config';

describe('使用对象的形式', () => {
  it('allow ', () => {
    // given
    config.allowTellAge = true;

    // when
    const age = tellAge();

    // then
    expect(age).toBe(18);
  });
});
```

关键点：​​

- 直接修改配置对象属性
- 测试不同条件下的行为
- 测试完成后最好重置配置状态

## 测试类(Class)

假设有一个类 User：

```js
// user.js
class User {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  getAge() {
    return this.age;
  }
}
```

测试用例

```js
// user.class.test.js
import { it, expect, describe } from 'vitest';
import { User } from './user';

describe('User类测试', () => {
  it('正确返回用户年龄', () => {
    // 1. 创建测试实例
    const user = new User('John Doe', 30);

    // 2. 测试方法
    expect(user.getAge()).toBe(30);
  });

  it('构造函数正确设置属性', () => {
    const user = new User('Alice', 25);
    expect(user.name).toBe('Alice');
    expect(user.age).toBe(25);
  });
});
```

关键点：​​

- 测试公共方法
- 验证构造函数是否正确初始化
- 可以测试边界情况和异常处理

## 测试常量

虽然常量通常不需要测试，但当它们影响业务逻辑时，我们可以使用模块模拟技术。

示例代码:

假设你有一个常量类 config：

config.js

```js
const config = {
  name: 'xzx',
  name: 18,
};

export default config;
```

```js
import { name } from './config';

export function tellName() {
  return name + '-hahaha';
}
```

测试用例:

```js
import { it, expect, describe, vi } from "vitest";
import { tellName } from "./use-variable";
import { name, gold } from "./config";

vi.mock("./config", async (importOriginal) => {
  const obj = await importOriginal() as any // 源文件的对象
  return { ...obj, name: "xiaohong" }; // 只改源文件的name值
});

describe("使用变量的形式", () => {
  it("tell name ", () => {
    console.log(gold);
    // when
    const name = tellName();

    // then
    expect(name).toBe("xiaohong-heiheihei");
  });
});
```

关键点：​​

- 使用 vi.mock 部分模拟模块
- 保留不需要修改的原始导出
- 可以测试常量在业务逻辑中的使用

# 总结

## 测试方法对比表

| 依赖类型  | 测试策略               | 关键技术               | 适用场景               |
| --------- | ---------------------- | ---------------------- | ---------------------- |
| 第三方库  | 模拟整个模块或特定方法 | `vi.mock`, `vi.mocked` | Axios 等外部服务调用   |
| 对象      | 直接修改对象属性       | 属性赋值               | 配置对象、状态对象     |
| 类(Class) | 实例化后测试方法       | 构造函数验证、方法调用 | 业务逻辑类、工具类     |
| 常量      | 模块模拟(部分或全部)   | `vi.mock`部分模拟      | 影响业务逻辑的配置常量 |
