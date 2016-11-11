const express = require('express')
const nunjucks = require('express-nunjucks')
const path = require('path')
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const compression = require('compression')
const routes = require('./routes/routes')
const log = require('./services/log')
const onFinished = require('on-finished')
const authentication = require('./authentication')

var app = express()

authentication(app)

// Use gzip compression - remove if possible via reverse proxy/Azure gateway.
app.use(compression())

// Set security headers.
app.use(helmet())

var packageJson = require('../package.json')
var developmentMode = app.get('env') === 'development'
var releaseVersion = packageJson.version
var serviceName = 'Assisted Prison Visit Service'

app.set('view engine', 'html')
app.set('views', path.join(__dirname, 'views'))

nunjucks(app, {
  watch: developmentMode,
  noCache: developmentMode
})

app.use('/public', express.static(path.join(__dirname, 'public')))
app.use('/public', express.static(path.join(__dirname, 'govuk_modules', 'govuk_template')))
app.use('/public', express.static(path.join(__dirname, 'govuk_modules', 'govuk_frontend_toolkit')))
app.use(favicon(path.join(__dirname, 'govuk_modules', 'govuk_template', 'images', 'favicon.ico')))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Send assetPath to all views.
app.use(function (req, res, next) {
  res.locals.asset_path = '/public/'
  next()
})

// Add variables that are available in all views.
app.use(function (req, res, next) {
  res.locals.serviceName = serviceName
  res.locals.releaseVersion = 'v' + releaseVersion
  next()
})

// Log each HTML request and it's response.
app.use(function (req, res, next) {
  // Log response started.
  log.info({ request: req }, 'Route Started.')

  // Log response finished.
  onFinished(res, function () {
    log.info({ response: res }, 'Route Complete.')
  })

  next()
})

// Build the router to route all HTTP requests and pass to the routes file for route configuration.
var router = express.Router()
routes(router)
app.use('/', router)

// catch 404 and forward to error handler.
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  res.status(404)
  next(err)
})

app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  if (err.status === 404) {
    res.render('includes/error-404')
  } else if (err.status === 401) {
    res.redirect('/auth/oauth2')
  } else if (err.status === 403) {
    res.render('includes/error-403')
  } else {
    res.render('includes/error', {
      error: developmentMode ? err : {}
    })
  }
})

module.exports = app
