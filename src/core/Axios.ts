import {
  AxiosRequestConfig,
  AxiosPromise,
  Method,
  AxiosResponse,
  ResolvedFn,
  RejectedFn
} from '../types'
import dispatchRequest, { transformURL } from './dispatchRequest'
import InterceptorManager from './InterceptorManager'
import mergeConfig from './mergeConfig'

// 拦截器接口
interface Interceptors {
  request: InterceptorManager<AxiosRequestConfig>
  response: InterceptorManager<AxiosResponse>
}

// 拦截器链式调用接口
interface PromiseChain {
  resolved: ResolvedFn | ((config: AxiosRequestConfig) => AxiosPromise)
  rejected?: RejectedFn
}

// 导出Axios类
export default class Axios {
  // 默认的请求配置
  defaults: AxiosRequestConfig
  // 定义一个 interceptors 属性作为接口
  interceptors: Interceptors

  constructor(initConfig: AxiosRequestConfig) {
    this.defaults = initConfig
    this.interceptors = {
      request: new InterceptorManager<AxiosRequestConfig>(),
      response: new InterceptorManager<AxiosResponse>()
    }
  }

  request(url: any, config?: any): AxiosPromise {
    // 判断 url 是否为字符串类型
    if (typeof url === 'string') {
      // 判断有无config
      if (!config) config = {}
      config.url = url
    } else {
      // 传入的就是单个参数，那么 url 就是 config`
      config = url
    }

    // 合并配置
    config = mergeConfig(this.defaults, config)
    // 方法名称最小化
    config.method = config.method.toLowerCase()
    // 构造一个 PromiseChain 类型的数组 chain
    const chain: PromiseChain[] = [
      {
        //  dispatchRequest 函数赋值给 resolved 属性
        resolved: dispatchRequest,
        rejected: undefined
      }
    ]

    // 遍历每个拦截器对象，把它们的 resolved 函数和 rejected 函数添加到 promise.then 的参数中
    // 请求拦截器，先执行后添加，后执行先添加
    this.interceptors.request.forEach(interceptor => {
      chain.unshift(interceptor)
    })

    // 响应拦截器，先执行先添加，后执行后添加
    this.interceptors.response.forEach(interceptor => {
      chain.push(interceptor)
    })

    let promise = Promise.resolve(config)

    while (chain.length) {
      // // chain.shift() 可能是 undefined , 这里需要非空断言运算符!
      const { resolved, rejected } = chain.shift()!
      promise = promise.then(resolved, rejected)
    }
    return promise
  }

  get(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('get', url, config)
  }

  delete(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('delete', url, config)
  }

  head(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('head', url, config)
  }

  options(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('options', url, config)
  }

  post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('post', url, data, config)
  }

  put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('put', url, data, config)
  }

  patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('patch', url, data, config)
  }

  getUri(config?: AxiosRequestConfig): string {
    config = mergeConfig(this.defaults, config)
    return transformURL(config)
  }
  // 不带data的风格
  _requestMethodWithoutData(method: Method, url: string, config?: AxiosRequestConfig) {
    return this.request(
      // 浅拷贝
      Object.assign(config || {}, {
        method,
        url
      })
    )
  }

  // 带data的风格
  _requestMethodWithData(method: Method, url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request(
      // 浅拷贝
      Object.assign(config || {}, {
        method,
        url,
        data
      })
    )
  }
}
