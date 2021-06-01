// 字符串字面量对象
export type Method =
  | 'get'
  | 'GET'
  | 'delete'
  | 'Delete'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH'

// Axios请求接口类型，?表示可选属性
export interface AxiosRequestConfig {
  // url 为请求的地址，(必选属性)转化为可选属性
  url?: string
  // method 是请求的 HTTP 方法，类型改为Method
  method?: Method
  // data 是 post、patch 等类型请求的数据，放到 request body 中
  data?: any
  // params 是 get、head 等类型请求的数据，拼接到 url 的 query string 中
  params?: any
  // 头部可选属性
  headers?: any
  // 返回数据的类型是一个 XMLHttpRequestResponseType 类型，它的定义是 "" | "arraybuffer" | "blob" | "document" | "json" | "text" 字符串字面量类型。可选
  responseType?: XMLHttpRequestResponseType
  // 请求的超时时间,默认的超时时间是 0，即永不超时
  timeout?: number
  // 转换请求和响应
  transformRequest?: AxiosTransformer | AxiosTransformer[]
  transformResponse?: AxiosTransformer | AxiosTransformer[]
  // 取消类
  cancelToken?: CancelToken
  // 携带cookie
  withCredentials?: boolean
  // 表示存储 token 的 cookie 名称
  xsrfCookieName?: string
  // 请求 headers 中 token 对应的 header 名称
  xsrfHeaderName?: string
  // 上传下载进度
  onDownloadProgress?: (e: ProgressEvent) => void
  onUploadProgress?: (e: ProgressEvent) => void
  // 授权身份
  auth?: AxiosBasicCredentials
  // 自定义状态码合法
  validateStatus?: (status: number) => boolean
  // 定义解析规则
  paramsSerializer?: (params: any) => string
  // 基本的URL
  baseURL?: string
  // 定义任意属性来取string类型的值
  [propName: string]: any
}

// Axios接收接口类型，?表示可选属性 添加泛型
export interface AxiosResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: any
  config: AxiosRequestConfig
  request: any
}

// 考虑到 axios 函数返回的是一个 Promise 对象，定义一个 AxiosPromise 接口
export interface AxiosPromise<T = any> extends Promise<AxiosResponse<T>> {}

// Axios错误接口
export interface AxiosError extends Error {
  // 配置
  config: AxiosRequestConfig
  // 状态码
  code?: string
  request?: any
  // 回复
  response?: AxiosResponse
  // 是否有错
  isAxiosError: boolean
}

// Axios接口 描述了 Axios 类中的公共方法
export interface Axios {
  // 默认：请求配置
  defaults: AxiosRequestConfig
  interceptors: {
    request: AxiosInterceptorManager<AxiosRequestConfig>
    response: AxiosInterceptorManager<AxiosResponse>
  }

  request<T = any>(config: AxiosRequestConfig): AxiosPromise<T>

  get<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>

  delete<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>

  head<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>

  options<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>

  getUri(config: AxiosRequestConfig): string
}

// AxiosInstance 接口继承 Axios，是一个混合类型的接口
export interface AxiosInstance extends Axios {
  <T = any>(config: AxiosRequestConfig): AxiosPromise<T>

  // 函数重载
  <T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>
}

// resolve 函数，请求拦截器是 AxiosRequestConfig 类型的，响应拦截器是 AxiosResponse 类型的
export interface ResolvedFn<T = any> {
  (val: T): T | Promise<T>
}

// reject 函数的参数类型则是 any 类型的。
export interface RejectedFn {
  (error: any): any
}

// 拦截器管理对象对外的接口
export interface AxiosInterceptorManager<T> {
  // 返回值的 number 是这个 interceptor 的 ID 用于 eject 的时候删除此 interceptor
  use(resolved: ResolvedFn<T>, rejected?: RejectedFn): number

  eject(id: number): void
}

// Axios转换接口
export interface AxiosTransformer {
  (data: any, headers?: any): any
}

// Axios静态方法接口
export interface AxiosStatic extends AxiosInstance {
  // 创造Axios实例
  create(config?: AxiosRequestConfig): AxiosInstance

  // 扩展静态方法
  CancelToken: CancelTokenStatic
  Cancel: CancelStatic
  // 是否取消
  isCancel: (value: any) => boolean
  // 静态方法all，需要用到泛型
  all<T>(promise: Array<T | Promise<T>>): Promise<T[]>

  spread<T, R>(callback: (...args: T[]) => R): (arr: T[]) => R

  // Axios静态类
  Axios: AxiosClassStatic
}

// 取消类 reason  类型是一个 Cancel 类型的实例
export interface CancelToken {
  promise: Promise<Cancel>
  reason?: Cancel

  // 已被请求，抛出异常
  throwIfRequested(): void
}

export interface Canceler {
  (message?: string): void
}

export interface CancelExecutor {
  (cancel: Canceler): void
}

// CancelTokenSource接口
export interface CancelTokenSource {
  token: CancelToken
  cancel: Canceler
}

// CancelToken 扩展静态接口
export interface CancelTokenStatic {
  // CancelTokenStatic 则作为 CancelToken 类的类类型
  new (executor: CancelExecutor): CancelToken

  // CancelTokenSource 作为 CancelToken 类静态方法 source 函数的返回值类型
  source(): CancelTokenSource
}

// 取消实例类型的接口
export interface Cancel {
  message?: string
}

// 取消类类型的接口定义
export interface CancelStatic {
  new (message?: string): Cancel
}

// 授权身份包含用户名和密码
export interface AxiosBasicCredentials {
  username: string
  password: string
}

// Axios静态方法
export interface AxiosClassStatic {
  new (config: AxiosRequestConfig): Axios
}
