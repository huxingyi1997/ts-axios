import { AxiosTransformer } from '../types'

// 重写转换类型
export default function transform(
  data: any,
  headers: any,
  fns?: AxiosTransformer | AxiosTransformer[]
): any {
  if (!fns) return data
  // 非数组转换为数组
  if (!Array.isArray(fns)) {
    fns = [fns]
  }

  fns.forEach(fn => {
    // 每个转换函数返回的 data 会作为下一个转换函数的参数 data 传入。

    data = fn(data, headers)
  })
  return data
}
