import axios from '../../src/index'
import 'nprogress/nprogress.css'
import NProgress from 'nprogress'

const instance = axios.create({})

// 上传下载监控
function calculatePercentage(loaded: number, total: number) {
  return Math.floor(loaded * 1.0) / total
}

function loadProgressBar() {
  const setupStartProgress = () => {
    instance.interceptors.request.use(config => {
      NProgress.start()
      return config
    })
  }

  const setupUpdateProgress = () => {
    const update = (e: ProgressEvent) => {
      console.log(e)
      NProgress.set(calculatePercentage(e.loaded, e.total))
    }
    instance.defaults.onDownloadProgress = update
    instance.defaults.onUploadProgress = update
  }

  const setupStopProgress = () => {
    instance.interceptors.response.use(
      response => {
        NProgress.done()
        return response
      },
      error => {
        NProgress.done()
        return Promise.reject(error)
      }
    )
  }

  setupStartProgress()
  setupUpdateProgress()
  setupStopProgress()
}

loadProgressBar()

const downloadEl = document.getElementById('download')

const downloadFileURL = 'https://img.mukewang.com/5cc01a7b0001a33718720632.jpg'

downloadEl.addEventListener('click', e => {
  instance.get(downloadFileURL).then(res => {
    console.log(
      `download file success, data.length: ${res.data.length}, data.url: ${res.config.url}`
    )
  })
})

const uploadEl = document.getElementById('upload')

uploadEl!.addEventListener('click', e => {
  const data = new FormData()
  const fileEl = document.getElementById('file') as HTMLInputElement
  if (fileEl.files) {
    data.append('file', fileEl.files[0])

    instance.post('/more/upload', data).then(() => {
      console.log('upload file success, you can see it on ./exapmles/accept-upload-file')
    })
  }
})
