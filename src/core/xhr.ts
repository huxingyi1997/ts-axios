// 导入Axios请求的配置
import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { parseHeaders } from '../helpers/headers'
import { createError } from '../helpers/error'
import { isURLSameOrigin } from '../helpers/url'
import cookie from '../helpers/cookie'
import { isFormData } from '../helpers/util'

// 导出 xhr 方法
export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  // 返回一个Promise
  return new Promise((resolve, reject) => {
    // 解构属性，为防止没有设置data和method，初始化赋值
    const {
      data = null,
      url = '',
      method = 'get',
      // 默认为空对象
      headers = {},
      responseType,
      timeout,
      cancelToken,
      withCredentials,
      xsrfCookieName,
      xsrfHeaderName,
      onDownloadProgress,
      onUploadProgress,
      auth,
      validateStatus
    } = config

    // 建立XHR请求，创建一个 request 实例
    const request = new XMLHttpRequest()

    // 初始化配置请求参数 方法，网址，发送,第三个参数为 async 是否是异步请求
    request.open(method.toUpperCase(), url, true)

    // 执行 configureRequest 配置 request 对象
    configureRequest()

    // 执行 addEvents 给 request 添加事件处理函数
    addEvents()

    // 执行 processHeaders 处理请求 headers
    processHeaders()

    // 执行 processCancel 处理请求取消逻辑。tr5
    processCancel()

    // 执行 request.send 方法发送请求，发送数据
    request.send(data)

    // 执行 configureRequest 配置 request 对象
    function configureRequest(): void {
      if (responseType) {
        request.responseType = responseType
      }

      if (timeout) {
        request.timeout = timeout
      }

      // 带有cookie
      if (withCredentials) {
        request.withCredentials = true
      }

      if (auth) {
        headers['Authorization'] = 'Basic ' + btoa(auth.username + ':' + auth.password)
      }
    }

    // 执行 addEvents 给 request 添加事件处理函数。
    function addEvents(): void {
      // 监听 readyState 属性变化
      request.onreadystatechange = function handleLoad() {
        // Ajax状态码请求已完成，且响应已就绪,未达到4返回
        if (request.readyState !== 4) return

        // 在请求完成前或者 XMLHttpRequest 出错，status的值为0。
        if (request.status === 0) return

        // 返回所有的响应头
        const responseHeaders = parseHeaders(request.getAllResponseHeaders())
        // 响应数据 如果 config 中配置了 responseType，我们把它设置到 request.responseType 中
        const responseData =
          responseType && responseType !== 'text' ? request.response : request.responseText
        // 响应数据
        const response: AxiosResponse = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config,
          request
        }

        handleResponse(response)
      }

      // 网络错误
      request.onerror = function handleError() {
        // 改为检测状态码
        reject(createError('Network Error', config, null, request))
      }

      // 超时错误
      request.ontimeout = function handleTimeout() {
        reject(createError(`Timeout of ${timeout} ms exceeded`, config, 'ECONNABORTED', request))
      }

      // 下载
      if (onDownloadProgress) {
        request.onprogress = onDownloadProgress
      }
      // 上传
      if (onUploadProgress) {
        request.upload.onprogress = onUploadProgress
      }
    }

    // 执行 processHeaders 处理请求 headers
    function processHeaders(): void {
      // 判断是否有数据
      if (isFormData(data)) {
        delete headers['Content-Type']
      }

      /**
       * 跨站请求伪造 xsrf 防御
       * 当请求开启了 withCredentials 或者是同源请求时
       * 如果存在 xsrfCookieName 则为请求 headers 带上它的值
       */
      if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
        const xsrfValue = cookie.read(xsrfCookieName)
        if (xsrfValue) {
          // 类型断言
          headers[xsrfHeaderName!] = xsrfValue
        }
      }

      // 传入的 data 为空的时候，请求 header 配置 Content-Type 是没有意义的，需要删除
      Object.keys(headers).forEach(name => {
        if (data === null && name.toLowerCase() === 'content-type') {
          delete headers[name]
        } else {
          request.setRequestHeader(name, headers[name])
        }
      })
    }

    // 执行 processCancel 处理请求取消逻辑。tr5
    function processCancel(): void {
      // 取消请求的逻辑
      if (cancelToken) {
        cancelToken.promise
          .then(reason => {
            request.abort()
            // 进入rejected状态
            reject(reason)
          })
          .catch(
            /* istanbul ignore next */
            () => {
              // do nothing
            }
          )
      }
    }

    // 根据回复消息的状态码决定调用resolve或reject函数
    function handleResponse(response: AxiosResponse) {
      // 响应的HTTP状态码必须在200-300之间
      if (!validateStatus || validateStatus(response.status)) {
        // 顺利响应
        resolve(response)
      } else {
        // 错误状态码
        reject(
          createError(
            `Request failed with status code ${response.status}`,
            config,
            null,
            request,
            response
          )
        )
      }
    }
  })
}
