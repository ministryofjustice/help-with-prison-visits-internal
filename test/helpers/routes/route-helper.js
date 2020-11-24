const mockViewEngine = require('../../unit/routes/mock-view-engine')
const express = require('express')
const bodyParser = require('body-parser')
const expressSanitized = require('express-sanitized')
const cookieParser = require('cookie-parser')

const VIEWS_DIRECTORY = '../../../app/views'

module.exports.buildApp = function (route) {
  const app = express()
  app.use(bodyParser.json())
  app.use(expressSanitized())
  app.use(cookieParser())

  app.use(function (req, res, next) {
    req.user = {
      email: 'test@test.com',
      first_name: 'Andrew',
      last_name: 'Adams',
      roles: ['caseworker', 'admin', 'sscl']
    }
    next()
  })

  route(app)
  mockViewEngine(app, VIEWS_DIRECTORY)

  app.use(function (req, res, next) {
    next(new Error())
  })

  app.use(function (err, req, res, next) {
    if (err) {
      res.status(500).render('includes/error')
    }
  })
  return app
}
