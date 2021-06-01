import { processHeaders } from './helpers/headers'
import { AxiosRequestConfig } from './types'
import { transformRequest, transformResponse } from './helpers/data'

const defaults: AxiosRequestConfig = {
  // 默认请求的方法
  method: 'get',
  // 默认超时时间
  timeout: 0,
  // 头部配置
  headers: {
    common: {
      Accept: 'application/json, text/plain, */*'
    }
  },
  // 表示存储 token 的 cookie 名称
  xsrfCookieName: 'XSRF-TOKEN',
  // 请求 headers 中 token 对应的 header 名称
  xsrfHeaderName: 'X-XSRF-TOKEN',
  // 转换请求和响应
  transformRequest: [
    function(data: any, headers: any) {
      processHeaders(headers, data)
      return transformRequest(data)
    }
  ],
  transformResponse: [
    function(data: any) {
      return transformResponse(data)
    }
  ],
  validateStatus(status: number): boolean {
    return status >= 200 && status < 300
  }
}

const methodsNoData = ['delete', 'get', 'head', 'options']

methodsNoData.forEach(method => {
  defaults.headers[method] = {}
})

const methodsWithData = ['post', 'put', 'patch']

methodsWithData.forEach(method => {
  defaults.headers[method] = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})

export default defaults
