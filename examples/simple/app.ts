import axios from '../../src/index'

// 发送 axios 请求
axios({
    method: 'get',
    url: '/simple/get',
    params: {
        a: 1,
        b: 2
    }
})