// Axios配置
// 导入Axios请求的配置
import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
// 导入写好的xhr文件
import xhr from './xhr'
// 导入写好的方法
import { buildURL, combineURL, isAbsoluteURL } from '../helpers/url'
import { transformRequest, transformResponse } from '../helpers/data'
import { flattenHeaders, processHeaders } from '../helpers/headers'
import transform from './transform'

// 解析url参数
export function transformURL(config: AxiosRequestConfig): string {
  // 解析url 和 params，变为可选属性后如果url未定义需要默认赋值
  let { url, params, paramsSerializer, baseURL } = config
  // 判断是否是绝对url需要断言
  if (baseURL && !isAbsoluteURL(url!)) {
    // 合并相对路径和绝对路径
    url = combineURL(baseURL, url)
  }
  return buildURL(url!, params, paramsSerializer)
}

// 全部放在processConfig中实现
// 解析data参数
// function transformRequestData(config: AxiosRequestConfig): any {
//   return transformRequest(config.data)
// }

// 解析头部
// function transformHeaders(config: AxiosRequestConfig) {
//   // 头部默认位空对象
//   const { headers = {}, data } = config
//   return processHeaders(headers, data)
// }

// 处理响应数据
function transformResponseData(res: AxiosResponse): AxiosResponse {
  // res.data = transformResponse(res.data)
  res.data = transform(res.data, res.headers, res.config.transformResponse)
  return res
}

// 处理请求配置
function processConfig(config: AxiosRequestConfig): void {
  // 注意解析顺序
  config.url = transformURL(config)
  // 处理 header 的时候依赖了 data，所以要在处理请求 body 数据之前处理请求 header
  // config.headers = transformHeaders(config)
  // 重构数据
  // config.data = transformRequestData(config)
  // 转换请求
  config.data = transform(config.data, config.headers, config.transformRequest)
  // 头部扁平化处理，方法处理，类型断言，可以保证运行时有值
  config.headers = flattenHeaders(config.headers, config.method!)
}

export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
  // 发送请求前检查一下配置的 cancelToken 是否已经使用过了
  throwIfCancellationRequested(config)
  // 处理config配置参数
  processConfig(config)
  // 发送请求,并处理结果数据
  return xhr(config).then(
    res => transformResponseData(res),
    // 对异常情况的响应数据做转换
    e => {
      if (e && e.response) {
        e.response = transformResponseData(e.response)
      }
      return Promise.reject(e)
    }
  )
}

// 检查cancelToken是否用过
function throwIfCancellationRequested(config: AxiosRequestConfig): void {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested()
  }
}
