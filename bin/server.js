const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const convert = require('koa-convert')
const logger = require('koa-logger')
const mongoose = require('mongoose')
const session = require('koa-generic-session')
const passport = require('koa-passport')
const mount = require('koa-mount')
const serve = require('koa-static')

const config = require('../config')
const errorMiddleware = require('../src/middleware')

// Create a Koa instance.
const app = new Koa()
app.keys = [config.session]

// Connect to the Mongo Database.
mongoose.Promise = global.Promise
mongoose.connect(config.database)

// MIDDLEWARE START

app.use(convert(logger()))
app.use(bodyParser())
app.use(session())
app.use(errorMiddleware())

// Used to generate the docs.
app.use(convert(mount('/docs', serve(`${process.cwd()}/docs`))))

// User Authentication
require('../config/passport')
app.use(passport.initialize())
app.use(passport.session())

// Custom Middleware Modules
const modules = require('../src/modules')
modules(app)

// MIDDLEWARE END

app.listen(config.port, () => {
  console.log(`Server started on ${config.port}`)
})

// export default app
module.exports = app
