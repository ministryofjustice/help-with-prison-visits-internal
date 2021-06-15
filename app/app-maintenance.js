const express = require('express')
const nunjucks = require('nunjucks')
const path = require('path')
const favicon = require('serve-favicon')

const app = express()
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
  watch: false,
  noCache: false
})

const publicFolders = ['public', 'assets', '../node_modules/govuk_template_jinja/assets', '../node_modules/govuk_frontend_toolkit']

publicFolders.forEach(dir => {
  app.use('/public', express.static(path.join(__dirname, dir)))
})

app.use(favicon(path.join(__dirname, '../node_modules/govuk_template_jinja/assets/images/favicon.ico')))

// Send assetPath to all views.
app.use(function (req, res, next) {
  res.locals.asset_path = '/public/'
  next()
})

// Add variables that are available in all views.
app.use(function (req, res, next) {
  res.locals.serviceName = serviceName
  next()
})

// Display maintenance page
app.use(function (req, res, next) {
  res.render('includes/maintenance')
})

module.exports = app
