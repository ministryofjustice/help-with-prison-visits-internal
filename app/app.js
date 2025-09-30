const express = require('express')
const crypto = require('crypto')
const path = require('path')
const helmet = require('helmet')
const compression = require('compression')
const { csrfSync } = require('csrf-sync')
const nunjucksSetup = require('./services/nunjucks-setup')
const htmlSanitizerMiddleware = require('./middleware/htmlSanitizer')
const roleCheckingMiddleware = require('./middleware/roleChecking')
const routes = require('./routes/routes')
const log = require('./services/log')
const authentication = require('./authentication')
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
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        '*.google-analytics.com',
        '*.googletagmanager.com',
        (_req, res) => `'nonce-${res.locals.cspNonce}'`,
      ],
      connectSrc: ["'self'", '*.google-analytics.com', '*.googletagmanager.com'],
      styleSrc: ["'self'"],
      fontSrc: ["'self'", 'data:'],
      imgSrc: ["'self'", '*.google-analytics.com', '*.googletagmanager.com'],
    },
  }),
)

const packageJson = require('../package.json')

const developmentMode = app.get('env') === 'development'
const releaseVersion = packageJson.version
const serviceName = 'Help with Prison Visits'
const organisationName = 'HMPPS'

nunjucksSetup(app, developmentMode)

const publicFolders = ['public', 'assets']

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
  '../node_modules/jquery/dist',
]
govukAssets.forEach(dir => {
  app.use('/assets', express.static(path.join(__dirname, dir)))
})

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(htmlSanitizerMiddleware())

// Send assetPath to all views.
app.use((req, res, next) => {
  res.locals.asset_path = '/public/'
  next()
})

// Add variables that are available in all views.
app.use((req, res, next) => {
  res.locals.serviceName = serviceName
  res.locals.organisationName = organisationName
  res.locals.releaseVersion = `v${releaseVersion}`
  res.locals.applicationRoles = applicationRoles
  next()
})

// Username handling.
app.use((req, res, next) => {
  if (!res.locals.user || !res.locals.user.name) {
    res.locals.serialisedName = ''
  } else {
    res.locals.serialisedName = nameSerialiser(res.locals.user.name)
  }
  next()
})

app.use((req, res, next) => {
  const exclude = csrfExcludeRoutes.some(route => req.method === 'POST' && req.originalUrl.includes(route))

  // CSRF protection
  if (!exclude) {
    const {
      csrfSynchronisedProtection, // This is the default CSRF protection middleware.
    } = csrfSync({
      getTokenFromRequest: innerReq => {
        // eslint-disable-next-line no-underscore-dangle
        return innerReq.body._csrf || innerReq.headers['x-csrf-token']
      },
    })

    csrfSynchronisedProtection()
  } else {
    next()
  }
})

app.use((req, res, next) => {
  if (typeof req.csrfToken === 'function') {
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
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  res.status(404)
  next(err)
})

// catch CSRF token errors
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err)
  log.error(err)
  res.status(403)
  return res.render('includes/error', {
    error: 'Invalid CSRF token',
  })
})

// Development error handler.
app.use((err, req, res, next) => {
  log.error(err)
  res.status(err.status || 500)
  if (err.status === 404) {
    res.render('includes/error-404')
  } else if (err.status === 401) {
    res.redirect('/login')
  } else if (err.status === 403) {
    res.render('includes/error-403')
  } else {
    res.render('includes/error', {
      error: developmentMode ? err : null,
    })
  }
})

module.exports = app
