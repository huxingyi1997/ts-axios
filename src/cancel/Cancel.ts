export default class Cancel {
  // 公共属性信息
  message?: string

  constructor(message?: string) {
    this.message = message
  }
}

// 判断是否是取消类型
export function isCancel(value: any): boolean {
  return value instanceof Cancel
}
