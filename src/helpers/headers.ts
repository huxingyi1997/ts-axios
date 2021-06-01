import { Method } from '../types'
import { deepMerge, isPlainObject } from './util'

// 头部正常化处理
function normalizeHeaderName(headers: any, normalizedName: string): void {
  if (!headers) return
  // 遍历头像
  Object.keys(headers).forEach(name => {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      // 保留常规化键名
      headers[normalizedName] = headers[name]
      delete headers[name]
    }
  })
}

export function processHeaders(headers: any, data: any) {
  normalizeHeaderName(headers, 'Content-Type')
  // 当我们传入的 data 为普通对象的时候，headers 如果没有配置 Content-Type 属性，需要自动设置请求 header 的 Content-Type 字段为：application/json;charset=utf-8
  if (isPlainObject(data)) {
    if (headers && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json;charset=utf-8'
    }
  }
  return headers
}

// 逐行处理数据
export function parseHeaders(headers: any): any {
  let parsed = Object.create(null)
  if (!headers) return parsed

  // 进行数据转换 ,line需要推定类型
  headers.split('\r\n').forEach((line: { split: (arg0: string) => [any, any] }) => {
    // 后半部分的字符串内部也可能有 ":"
    let [key, ...vals] = line.split(':')
    key = key.trim().toLowerCase()
    if (!key) return

    // 字符串中 ":" 后面部分都截断了
    let val = vals.join(':').trim()
    parsed[key] = val
  })

  return parsed
}

// 头部扁平化处理
export function flattenHeaders(headers: any, method: Method): any {
  // 返回头部
  if (!headers) return headers

  // 头部合并
  headers = deepMerge(headers.common || {}, headers[method] || {}, headers)

  // 需要删除的信息
  const methodsToDelete = ['delete', 'get', 'head', 'options', 'post', 'put', 'patch', 'common']

  // 把方法删除
  methodsToDelete.forEach(method => {
    delete headers[method]
  })

  return headers
}
