const config = require('../config')
const express = require('express')
const crypto = require('crypto')
const nunjucksSetup = require('./services/nunjucks-setup')
const path = require('path')
const favicon = require('serve-favicon')
const helmet = require('helmet')
const compression = require('compression')
const htmlSanitizerMiddleware = require('./middleware/htmlSanitizer')
const roleCheckingMiddleware = require('./middleware/roleChecking')
const routes = require('./routes/routes')
const log = require('./services/log')
// const onFinished = require('on-finished')
const authentication = require('./authentication')
const cookieParser = require('cookie-parser')
const csurf = require('csurf')
const csrfExcludeRoutes = require('./constants/csrf-exclude-routes')
const applicationRoles = require('./constants/application-roles-enum')
const { nameSerialiser } = require('./views/helpers/username-serialiser')

const app = express()

authentication(app)

// Use gzip compression - remove if possible via reverse proxy/Azure gateway.
app.use(compression())

// Set security headers.
app.use(helmet())
app.use(helmet.hsts({ maxAge: 5184000 }))

// Configure Content Security Policy
// Hashes for inline Gov Template script entries
app.use((_req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('hex')
  next()
})
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      '*.google-analytics.com',
      (_req, res) => `'nonce-${res.locals.cspNonce}'`
    ],
    connectSrc: ["'self'", '*.google-analytics.com'],
    styleSrc: ["'self'"],
    fontSrc: ["'self'", 'data:'],
    imgSrc: ["'self'", '*.google-analytics.com']
  }
}))

const packageJson = require('../package.json')
const developmentMode = app.get('env') === 'development'
const releaseVersion = packageJson.version
const serviceName = 'Help with Prison Visits'
const organisationName = 'HMPPS'

nunjucksSetup(app, developmentMode)

const publicFolders = ['public', 'assets', '../node_modules/govuk_template_jinja/assets', '../node_modules/govuk_frontend_toolkit']

publicFolders.forEach(dir => {
  app.use('/public', express.static(path.join(__dirname, dir)))
})

// jquery asset paths
const govukAssets = [
  '../node_modules/@ministryofjustice/frontend/moj/assets',
  '../node_modules/@ministryofjustice/frontend',
  '../node_modules/govuk-frontend/dist/govuk/assets',
  '../node_modules/govuk-frontend/dist',
  '../node_modules/datatables.net',
  '../node_modules/datatables.net-dt',
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
  res.locals.asset_path = '/public/'
  next()
})

// Add variables that are available in all views.
app.use(function (req, res, next) {
  res.locals.serviceName = serviceName
  res.locals.organisationName = organisationName
  res.locals.releaseVersion = 'v' + releaseVersion
  res.locals.applicationRoles = applicationRoles
  next()
})

// Username handling.
app.use(function (req, res, next) {
  if (!res.locals.user || !res.locals.user.name) {
    res.locals.serialisedName = ''
  } else {
    res.locals.serialisedName = nameSerialiser(res.locals.user.name)
  }
  next()
})

// Log each HTML request and it's response.
app.use(function (req, res, next) {
  // Log response started.
  // log.info({ request: req }, 'Route Started.')

  // Log response finished.
  // onFinished(res, function () {
  //   log.info({ response: res }, 'Route Complete.')
  // })

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

// Add middleware to check roles for navigation
app.use(roleCheckingMiddleware())

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

module.exports = app
