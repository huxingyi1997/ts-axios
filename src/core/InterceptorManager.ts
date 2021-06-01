import { ResolvedFn, RejectedFn } from '../types'

interface Interceptor<T> {
  resolved: ResolvedFn<T>
  rejected?: RejectedFn
}

// 泛型类
export default class InterceptorManager<T> {
  private interceptors: Array<Interceptor<T> | null>

  // 存储拦截器
  constructor() {
    this.interceptors = []
  }

  // 添加拦截器到 interceptors 中，并返回一个 `id`
  use(resolved: ResolvedFn<T>, rejected?: RejectedFn): number {
    this.interceptors.push({
      resolved,
      rejected
    })
    return this.interceptors.length - 1
  }

  // 遍历 interceptors ，支持传入一个函数，遍历过程中会调用该函数，并把每一个 interceptor 作为该函数的参数传入
  forEach(fn: (interceptor: Interceptor<T>) => void): void {
    this.interceptors.forEach(interceptor => {
      if (interceptor !== null) {
        fn(interceptor)
      }
    })
  }

  // eject 就是删除一个拦截器，通过传入拦截器的 `id` 删除
  eject(id: number): void {
    if (this.interceptors[id]) {
      this.interceptors[id] = null
    }
  }
}
