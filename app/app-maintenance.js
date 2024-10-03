const express = require('express')
const nunjucksSetup = require('./services/nunjucks-setup')
const path = require('path')
const favicon = require('serve-favicon')
const onFinished = require('on-finished')
const log = require('./services/log')

const app = express()
const serviceName = 'Help with Prison Visits'
const organisationName = 'HMPPS'
const developmentMode = app.get('env') === 'development'
const { nameSerialiser } = require('./views/helpers/username-serialiser')

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
  '../node_modules/jquery/dist',
  '../node_modules/datatables.net',
  '../node_modules/datatables.net-dt'
]
govukAssets.forEach(dir => {
  app.use('/assets', express.static(path.join(__dirname, dir)))
})

app.use(favicon(path.join(__dirname, '../node_modules/govuk_template_jinja/assets/images/favicon.ico')))

// Send assetPath to all views.
app.use(function (req, res, next) {
  res.locals.asset_path = '/public/'
  res.locals.serviceName = serviceName
  res.locals.organisationName = organisationName
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
  log.info({ request: req }, 'Route Started.')

  // Log response finished.
  onFinished(res, function () {
    log.info({ response: res }, 'Route Complete.')
  })

  next()
})

// Display maintenance page
app.use(function (req, res, next) {
  res.render('includes/maintenance')
})

// catch 404 and forward to error handler.
app.use(function (req, res, next) {
  const err = new Error('Not Found')
  err.status = 404
  res.status(404)
  next(err)
})

// Development error handler.
app.use(function (err, req, res, next) {
  log.error({ error: err })
  res.status(err.status || 500)
  if (err.status === 404) {
    res.render('includes/error-404')
  } else if (err.status === 403) {
    res.render('includes/error-403')
  } else {
    res.render('includes/error', {
      error: developmentMode ? err : null
    })
  }
})

module.exports = app
