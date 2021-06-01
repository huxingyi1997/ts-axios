import { deepMerge, isPlainObject } from '../helpers/util'
import { AxiosRequestConfig } from '../types/index'

// 使用全局变量记录键名
const strats = Object.create(null)

// 默认合并策略
function defaultStrat(val1: any, val2: any): any {
  return typeof val2 !== 'undefined' ? val2 : val1
}

// 只接受自定义配置合并策略
function fromVal2Strat(val1: any, val2: any): any {
  if (typeof val2 !== 'undefined') {
    return val2
  }
}

// 默认配置没有意义的属性
const stratKeysFromVal2 = ['url', 'params', 'data']

stratKeysFromVal2.forEach(key => {
  strats[key] = fromVal2Strat
})

// 头部和授权信息属于复杂对象
const stratKeysDeepMerge = ['headers', 'auth']

// 遍历复杂对象
stratKeysDeepMerge.forEach(key => {
  strats[key] = deepMergeStrat
})

// 复杂对象合并,属性如 headers
function deepMergeStrat(val1: any, val2: any): any {
  // val2是扁平对象
  if (isPlainObject(val2)) {
    // 调用已经写好的deepMerge函数
    return deepMerge(val1, val2)
  } else if (typeof val2 !== 'undefined') {
    // 直接返回原始类型
    return val2
  } else if (isPlainObject(val1)) {
    // 只保留一个参数
    return deepMerge(val1)
  } else {
    // 直接返回原始类型
    return val1
  }
}

// 合并两个配置
export default function mergeConfig(
  config1: AxiosRequestConfig,
  config2?: AxiosRequestConfig
): AxiosRequestConfig {
  if (config2 === undefined || config2 === null) {
    config2 = {}
  }

  const config = Object.create(null)

  // 遍历config2
  for (const key in config2) {
    mergeField(key)
  }
  // 遍历config1
  for (const key in config1) {
    if (!config2[key]) {
      mergeField(key)
    }
  }
  return config

  // 合并两个键
  function mergeField(key: string): void {
    const strat = strats[key] || defaultStrat
    config[key] = strat(config1[key], config2![key])
  }
}
