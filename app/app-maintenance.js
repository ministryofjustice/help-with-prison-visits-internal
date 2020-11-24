const express = require('express')
const nunjucks = require('express-nunjucks')
const path = require('path')
const favicon = require('serve-favicon')

const app = express()
const serviceName = 'Help with Prison Visits'

app.set('view engine', 'html')
app.set('views', path.join(__dirname, 'views'))

nunjucks(app, {
  watch: false,
  noCache: false
})

app.use('/public', express.static(path.join(__dirname, 'public')))
app.use('/public', express.static(path.join(__dirname, 'govuk_modules', 'govuk_template')))
app.use('/public', express.static(path.join(__dirname, 'govuk_modules', 'govuk_frontend_toolkit')))
app.use(favicon(path.join(__dirname, 'govuk_modules', 'govuk_template', 'images', 'favicon.ico')))

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
