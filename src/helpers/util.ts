const myToString = Object.prototype.toString

// 判断是否是Date数据类型
export function isDate(val: any): val is Date {
  return myToString.call(val) === '[object Date]'
}

// 判断是否是对象,注释掉
// export function isObject (val: any): val is Object {
//     return val !== null && typeof val === 'object'
// }

// 判断是否是简单对象
export function isPlainObject(val: any): val is Object {
  return myToString.call(val) === '[object Object]'
}

// 混合对象使用交叉类型和类型断言
export function extend<T, U>(to: T, from: U): T & U {
  for (const key in from) {
    // 断言
    ;(to as T & U)[key] = from[key] as any
  }
  // 返回断言的交叉类型
  return to as T & U
}

// 深拷贝合并对象数组
export function deepMerge(...objs: any[]): any {
  // 结果数组
  const result = Object.create(null)

  // 遍历数组
  objs.forEach(obj => {
    if (obj) {
      // 遍历每个键
      Object.keys(obj).forEach(key => {
        const val = obj[key]
        // 判断是否需要递归调用
        if (isPlainObject(val)) {
          // 根据存储的结果判断
          if (isPlainObject(result[key])) {
            // 递归调用
            result[key] = deepMerge(result[key], val)
          } else {
            result[key] = deepMerge({}, val)
          }
        } else {
          // 直接赋值
          result[key] = val
        }
      })
    }
  })
  return result
}

// 判断是否是搜索参数
export function isURLSearchParams(val: any): val is URLSearchParams {
  return typeof val !== 'undefined' && val instanceof URLSearchParams
}

// 判断 是否是FormData 的方法
export function isFormData(val: any): boolean {
  return typeof val !== 'undefined' && val instanceof FormData
}
