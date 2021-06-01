// 导入包
const express = require('express')
const bodyParser = require('body-parser')
const webpack = require('webpack')
const path = require('path')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
// 导入webpack配置
const WebpackConfig = require('./webpack.config')
const multipart = require('connect-multiparty')
const atob = require('atob')
// 导入服务器2
require('./server2')

// 创建express实例
const app = express()
// 编译
const complier = webpack(WebpackConfig)

/* 热重载
 *webpack-dev-middleware 是一个容器(wrapper)，它可以把 webpack 处理后的文件传递给一个服务器(server)。 webpack-dev-server 在内部使用了它，同时，它也可以作为一个单独的包来使用，以便进行更多自定*义设置来实现更多的需求。
 */
app.use(
  webpackDevMiddleware(complier, {
    // 绑定中间件的公共路径
    // 使用与webpack相同
    publicPath: '/__build__/',
    stats: {
      // 用于形成统计信息的选项
      colors: true,
      // 将控制台输出的代码块信息关闭
      chunks: false
    }
  })
)
// 热更新
app.use(webpackHotMiddleware(complier))

// 所在的目录设置为静态文件目录
app.use(express.static(__dirname))
// 返回一个只解析json的中间件
app.use(bodyParser.json())
// 解析 request 中 body的 urlencoded字符， 只支持utf-8的编码的字符,也支持自动的解析gzip和 zlib。
// 返回的对象是一个键值对，当extended为false的时候，键值对中的值就为'String'或'Array'形式，为true的时候，则可为任何数据类型。
app.use(bodyParser.urlencoded({ extended: true }))
app.use(
  express.static(__dirname, {
    setHeaders(res) {
      res.cookie('XSRF-TOKEN-D', '1234abc')
    }
  })
)

// 用于将文件上传到指定文件
app.use(
  multipart({
    uploadDir: path.resolve(__dirname, 'upload-file')
  })
)

// 路由引入
const router = express.Router()

// 路由配置
// 初始化项目
router.get('/simple/get', function(req, res) {
  res.json({
    msg: 'hello world'
  })
})

// 基础功能实现
router.get('/base/get', function(req, res) {
  res.json(req.query)
})

router.post('/base/post', function(req, res) {
  res.json(req.body)
})

router.post('/base/buffer', function(req, res) {
  let msg = []
  req.on('data', chunk => {
    if (chunk) {
      msg.push(chunk)
    }
  })
  req.on('end', () => {
    let buf = Buffer.concat(msg)
    res.json(buf.toJSON())
  })
})

// 异常情况处理
router.get('/error/get', function(req, res) {
  if (Math.random() > 0.5) {
    res.json({
      msg: `hello world`
    })
  } else {
    res.status(500)
    res.end()
  }
})

router.get('/error/timeout', function(req, res) {
  setTimeout(() => {
    res.json({
      msg: `hello world`
    })
  }, 3000)
})

// 接口扩展
router.get('/extend/get', function(req, res) {
  res.json({
    msg: 'hello world'
  })
})

router.options('/extend/options', function(req, res) {
  res.end()
})

router.head('/extend/head', function(req, res) {
  res.end()
})

router.delete('/extend/delete', function(req, res) {
  res.end()
})

router.post('/extend/post', function(req, res) {
  res.json(req.body)
})

router.put('/extend/put', function(req, res) {
  res.json(req.body)
})

router.patch('/extend/patch', function(req, res) {
  res.json(req.body)
})

// 响应数据支持泛型接口
router.get('/extend/user', function(req, res) {
  res.json({
    code: 0,
    message: 'ok',
    result: {
      name: 'Alice',
      age: 18
    }
  })
})

// 拦截器
router.get('/interceptor/get', function(req, res) {
  res.end('hello ')
})

router.post('/config/post', function(req, res) {
  res.json(req.body)
})

// 取消功能
router.get('/cancel/get', function(req, res) {
  setTimeout(() => {
    res.json('hello')
  }, 1000)
})

router.post('/cancel/post', function(req, res) {
  setTimeout(() => {
    res.json(req.body)
  }, 1000)
})

// 更多功能
router.get('/more/get', (req, res) => {
  res.json(req.cookies)
})

router.post('/more/upload', function(req, res) {
  console.log(req.body, req.files)
  res.end('upload success!')
})

router.post('/more/post', function(req, res) {
  const auth = req.headers.authorization
  const [type, credentials] = auth.split(' ')
  console.log('atob on server:', atob(credentials))
  const [username, password] = atob(credentials)
    .split(':')
    .map(item => item.trim())
  if (type === 'Basic' && username === 'Yee' && password === '123456') {
    res.json(req.body)
  } else {
    res.status(401)
    res.end('UnAuthorization')
  }
})

router.get('/more/304', function(req, res) {
  res.status(304)
  res.end()
})

router.get('/more/A', function(req, res) {
  res.end('A')
})

router.get('/more/B', function(req, res) {
  res.end('B')
})

app.use(router)

// 端口
const port = process.env.PORT || 8080
module.export = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}, Ctrl+C to stop`)
})
