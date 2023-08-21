const config = require('../config')
const express = require('express')
const nunjucks = require('nunjucks')
const path = require('path')
const favicon = require('serve-favicon')
const helmet = require('helmet')
const compression = require('compression')
const htmlSanitizerMiddleware = require('./middleware/htmlSanitizer')
const routes = require('./routes/routes')
const log = require('./services/log')
const onFinished = require('on-finished')
const authentication = require('./authentication')
const cookieParser = require('cookie-parser')
const csurf = require('csurf')
const csrfExcludeRoutes = require('./constants/csrf-exclude-routes')

module.exports = function (appInsights) {
  const app = express()

  authentication(app)

  // Use gzip compression - remove if possible via reverse proxy/Azure gateway.
  app.use(compression())

  // Set security headers.
  app.use(helmet())
  app.use(helmet.hsts({ maxAge: 5184000 }))

  // Configure Content Security Policy
  // Hashes for inline Gov Template script entries
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'",
        "'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU='",
        "'sha256-G29/qSW/JHHANtFhlrZVDZW1HOkCDRc78ggbqwwIJ2g='",
        'www.google-analytics.com'],
      connectSrc: ["'self'", 'www.google-analytics.com'],
      styleSrc: ["'self'"],
      fontSrc: ["'self'", 'data:'],
      imgSrc: ["'self'", 'www.google-analytics.com']
    }
  }))

  const packageJson = require('../package.json')
  const developmentMode = app.get('env') === 'development'
  const releaseVersion = packageJson.version
  const serviceName = 'Help with Prison Visits'

  const appViews = [
    path.join(__dirname, '../node_modules/govuk_template_jinja/'),
    path.join(__dirname, 'views')
  ]

  // View Engine Configuration
  app.set('view engine', 'html')
  nunjucks.configure(appViews, {
    express: app,
    autoescape: true,
    watch: developmentMode,
    noCache: developmentMode
  })

  const publicFolders = ['public', 'assets', '../node_modules/govuk_template_jinja/assets', '../node_modules/govuk_frontend_toolkit']

  publicFolders.forEach(dir => {
    app.use('/public', express.static(path.join(__dirname, dir)))
  })

  // jquery asset paths
  const govukAssets = [
    '../node_modules/datatables.net/js',
    '../node_modules/datatables.net-dt/css',
    '../node_modules/jquery/dist'
  ]
  govukAssets.forEach(dir => {
    app.use('/assets', express.static(path.join(__dirname, dir)))
  })

  app.use(favicon(path.join(__dirname, '../node_modules/govuk_template_jinja/assets/images/favicon.ico')))

  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(htmlSanitizerMiddleware())

  // Send assetPath to all views.
  app.use(function (req, res, next) {
    res.locals.appInsights = appInsights
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

  // Use cookie parser middleware (required for csurf)
  app.use(cookieParser(config.INT_APPLICATION_SECRET, { httpOnly: true, secure: config.INT_SECURE_COOKIE === 'true' }))

  // Check for valid CSRF tokens on state-changing methods.
  const csrfProtection = csurf({ cookie: { httpOnly: true, secure: config.INT_SECURE_COOKIE === 'true' } })

  app.use(function (req, res, next) {
    let exclude = false
    csrfExcludeRoutes.forEach(function (route) {
      if (req.originalUrl.includes(route) && req.method === 'POST') {
        exclude = true
      }
    })
    if (exclude) {
      next()
    } else {
      csrfProtection(req, res, next)
    }
  })

  // Generate CSRF tokens to be sent in POST requests
  app.use(function (req, res, next) {
    if (Object.prototype.hasOwnProperty.call(req, 'csrfToken')) {
      res.locals.csrfToken = req.csrfToken()
    }
    next()
  })

  // Build the router to route all HTTP requests and pass to the routes file for route configuration.
  const router = express.Router()
  routes(router)
  app.use('/', router)

  // catch 404 and forward to error handler.
  app.use(function (req, res, next) {
    const err = new Error('Not Found')
    err.status = 404
    res.status(404)
    next(err)
  })

  // catch CSRF token errors
  app.use(function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err)
    log.error({ error: err })
    res.status(403)
    res.render('includes/error', {
      error: 'Invalid CSRF token'
    })
  })

  // Development error handler.
  app.use(function (err, req, res, next) {
    log.error({ error: err })
    res.status(err.status || 500)
    if (err.status === 404) {
      res.render('includes/error-404')
    } else if (err.status === 401) {
      res.redirect('/login')
    } else if (err.status === 403) {
      res.render('includes/error-403')
    } else {
      res.render('includes/error', {
        error: developmentMode ? err : null
      })
    }
  })

  return app
}
