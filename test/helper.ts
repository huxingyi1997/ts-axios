export function getAjaxRequest(): Promise<JasmineAjaxRequest> {
  // 返回Promise
  return new Promise(function(resolve) {
    setTimeout(() => {
      // 通过 jasmine.Ajax.requests.mostRecent() 拿到最近一次请求的 request 对象，这个 request 对象是 jasmine-ajax 库伪造的 xhr 对象，它模拟了 xhr 对象上的方法
      return resolve(jasmine.Ajax.requests.mostRecent())
    }, 0)
  })
}
