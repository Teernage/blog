/**
 * 创建一个响应式对象
 * @param {Object|Array} target 需要转换为响应式的对象
 * @param {boolean} [isShallow=false] 是否为浅响应式
 * @param {boolean} [isReadonly=false] 是否为只读模式
 * @returns {Proxy} 返回代理后的响应式对象
 * @throws {TypeError} 当传入的target不是对象时抛出错误
 */
function createReactive(target, isShallow = false, isReadonly = false) {
  // 参数校验
  if (!target || typeof target !== 'object') {
    throw new TypeError('Target must be an object');
  }

  // 检查对象是否已经被代理
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }

  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      // 收集依赖
      if (!isReadonly) {
        track(target, key);
      }
      const res = Reflect.get(target, key, receiver);
      // 浅响应直接返回原始值
      if (isShallow) {
        return res;
      }
      // 深响应则需要递归代理
      if (typeof res === 'object' && res !== null) {
        return isReadonly ? readonly(res) : reactive(res);
      }

      return res;
    },

    set(target, key, newVal, receiver) {
      if (isReadonly) {
        console.warn(`属性 "${key}" 是只读的`);
        return true;
      }
      const oldVal = target[key];
      // 数组特殊处理
      const hadKey = Array.isArray(target)
        ? Number(key) < target.length
        : Object.prototype.hasOwnProperty.call(target, key);

      const result = Reflect.set(target, key, newVal, receiver);

      if (result) {
        // 只有当值真正发生变化时才触发更新
        if (!hadKey) {
          trigger(target, key, 'ADD');
        } else if (hasChanged(oldVal, newVal)) {
          trigger(target, key, 'SET');
        }
      }

      return result;
    },

    deleteProperty(target, key) {
      if (isReadonly) {
        console.warn(`属性 "${key}" 是只读的`);
        return true;
      }

      const hadKey = Object.prototype.hasOwnProperty.call(target, key);
      const result = Reflect.deleteProperty(target, key);

      if (result && hadKey) {
        trigger(target, key, 'DELETE');
      }

      return result;
    },

    // 拦截 Object.keys 等操作
    ownKeys(target) {
      track(target, Array.isArray(target) ? 'length' : ITERATE_KEY);
      return Reflect.ownKeys(target);
    },

    has(target, key) {
      track(target, key);
      return Reflect.has(target, key);
    },
  });

  proxyMap.set(target, proxy);

  return proxy;
}

// 工具函数：检查值是否发生变化
function hasChanged(value, oldValue) {
  return !Object.is(value, oldValue);
}

// 用于存储已创建的代理对象
const proxyMap = new WeakMap();

// Symbol key for iteration
const ITERATE_KEY = Symbol('iterate');
