import { Canceler, CancelExecutor } from '../types/index'
import Cancel from './Cancel'

// 解决Promise的函数接口
interface ResolvePromise {
  (reason?: Cancel): void
}

/**
 * 外部实例化 CancelToken 得到 cancelToken
 * 此时 cancelToken.promise 处于 pending 状态
 * 一旦调用 cancelToken.promise.then
 */
export default class CancelToken {
  promise: Promise<Cancel>
  reason?: Cancel

  constructor(executor: CancelExecutor) {
    let resolvePromise: ResolvePromise
    // 实例化一个 pending 状态的 Promise 对象
    this.promise = new Promise<Cancel>(resolve => {
      /**
       * 不能将类型“(value: Cancel | PromiseLike<Cancel>) => void”分配给类型“ResolvePromise”。
       * 参数“value”和“reason” 的类型不兼容。
       * 不能将类型“Cancel | undefined”分配给类型“Cancel | PromiseLike<Cancel>”。
       * 不能将类型“undefined”分配给类型“Cancel | PromiseLike<Cancel>”。
       */

      // @ts-ignore
      resolvePromise = resolve
    })

    // 执行 executor 函数，传入一个 cancel 函数
    executor(message => {
      // 找到原因取消
      if (this.reason) return
      // 保存信息并执行promise
      this.reason = new Cancel(message)
      // 调用 resolvePromise 把 Promise 对象从 pending 状态变为 resolved 状态
      resolvePromise(this.reason)
    })
  }

  static source() {
    // 定义 cancel 变量实例化一个 CancelToken 类型的对象，需要类型断言
    let cancel!: Canceler
    // 在 executor 函数中，把 cancel 指向参数 c 这个取消函数
    const token = new CancelToken(c => {
      cancel = c
    })
    return { token, cancel }
  }

  throwIfRequested(): void {
    if (this.reason) throw this.reason
  }
}
