// Axios配置与导出
import Axios from './core/Axios'
import mergeConfig from './core/mergeConfig'
import defaults from './defaults'
import { extend } from './helpers/util'
import { AxiosRequestConfig, AxiosStatic } from './types/index'
import Cancel, { isCancel } from './cancel/Cancel'
import CancelToken from './cancel/CancelToken'

// 工厂函数
function createInstance(config: AxiosRequestConfig): AxiosStatic {
  // 实例化 Axios
  const context = new Axios(config)
  // 创建instance 指向 Axios.prototype.request 方法，并绑定了上下文 context
  const instance = Axios.prototype.request.bind(context)

  // 通过 extend 方法把 context 中的原型方法和实例方法全部拷贝到 instance 上，这样就实现了一个混合对象
  extend(instance, context)

  // 断言成 AxiosInstance 类型
  // return instance as AxiosInstance
  return instance as AxiosStatic
}

const axios = createInstance(defaults)

axios.create = function create(config: AxiosRequestConfig): AxiosStatic {
  // 根据和默认设置融合的配置创造实例
  return createInstance(mergeConfig(defaults, config))
}

// 添加静态方法
axios.CancelToken = CancelToken
axios.Cancel = Cancel
axios.isCancel = isCancel

axios.all = function all(promises) {
  return Promise.all(promises)
}

axios.spread = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr)
  }
}

axios.Axios = Axios
export default axios
