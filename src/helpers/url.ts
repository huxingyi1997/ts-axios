import { isDate, isPlainObject, isURLSearchParams } from './util'

function encode(val: string): string {
  // 转义序列替换字符, @、:、$、,、 、[、]
  return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
}

// 导出经过编码的url
export function buildURL(url: string, params?: any, paramsSerializer?: (params: any) => string) {
  // 没有任何参数
  if (!params) return url

  // 自定义序列化参数
  let serializedParams

  if (paramsSerializer) {
    serializedParams = paramsSerializer(params)
  } else if (isURLSearchParams(params)) {
    serializedParams = params.toString()
  } else {
    // 字符串数组,用来拼接
    const parts: string[] = []

    Object.keys(params).forEach(key => {
      let val = params[key]
      if (val === null || typeof val === 'undefined') return

      let values = []

      // 判断是数组还是一般对象
      if (Array.isArray(val)) {
        values = val
        key += '[]'
      } else {
        // 不是数组转化成数组
        values = [val]
      }

      values.forEach(val => {
        if (isDate(val)) {
          // 转化日期
          val = val.toISOString()
        } else if (isPlainObject(val)) {
          val = JSON.stringify(val)
        }
        // 存放经过转换的键值对
        parts.push(`${encode(key)}=${encode(val)}`)
      })
    })

    // 拼接每个转换后的键值对
    serializedParams = parts.join('&')
  }
  if (serializedParams) {
    // 丢弃哈希标记
    const markIndex = url.indexOf('#')

    if (markIndex !== -1) {
      url = url.slice(0, markIndex)
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
  }

  return url
}

// 判断协议和主机号
interface URLOrigin {
  protocol: string
  host: string
}

const urlParsingNode = document.createElement('a')

// 将url解析为协议和主机
function resolveURL(url: string): URLOrigin {
  // 小技巧 ，创建一个 a 标签的 DOM，然后设置 href 属性为我们传入的 url，然后可以获取该 DOM 的 protocol、host
  urlParsingNode.setAttribute('href', url)
  const { protocol, host } = urlParsingNode

  return { protocol, host }
}
// 当前网站的协议和主机
const currentOrigin = resolveURL(window.location.href)

// 判断是否是同源网站
export function isURLSameOrigin(requestURL: string): boolean {
  const parsedOrigin = resolveURL(requestURL)
  return (
    parsedOrigin.protocol === currentOrigin.protocol && parsedOrigin.host === currentOrigin.host
  )
}

// 是否是绝对url
export function isAbsoluteURL(url: string): boolean {
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url)
}

// 合并url
export function combineURL(baseURL: string, relativeURL?: string): string {
  return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL
}
