const cookie = {
  read(name: string): string | null {
    // 正则表达式解析name对应的值
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'))
    // 将读取的name进行解码
    return match ? decodeURIComponent(match[3]) : null
  }
}

export default cookie
