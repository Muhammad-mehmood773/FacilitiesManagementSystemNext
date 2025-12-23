process.on('uncaughtException', (err) => {
  console.error('🔥 UNCAUGHT EXCEPTION 🔥')
  console.error(err.stack)
})

process.on('unhandledRejection', (reason) => {
  console.error('🔥 UNHANDLED PROMISE 🔥')
  console.error(reason)
})

const { createServer } = require('http')
const next = require('next')

const port = 3000
const dev = false
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res)
  }).listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
