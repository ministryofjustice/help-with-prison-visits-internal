const mockViewEngine = require('../../unit/routes/mock-view-engine')
const express = require('express')
const cookieParser = require('cookie-parser')
const htmlSanitizerMiddleware = require('../../../app/middleware/htmlSanitizer')
const applicationRoles = require('../../../app/constants/application-roles-enum')

const VIEWS_DIRECTORY = '../../../app/views'

module.exports.buildApp = function (route) {
  const app = express()
  app.use(express.json())
  app.use(htmlSanitizerMiddleware())
  app.use(cookieParser())

  app.use(function (req, res, next) {
    req.user = {
      email: 'test@test.com',
      first_name: 'Andrew',
      last_name: 'Adams',
      // APVS0246
      roles: [
        applicationRoles.CLAIM_ENTRY_BAND_2,
        applicationRoles.CLAIM_PAYMENT_BAND_3,
        applicationRoles.CASEWORK_MANAGER_BAND_5,
        applicationRoles.BAND_9,
        applicationRoles.HWPV_SSCL
      ]
      // old roles: ['caseworker', 'admin', 'sscl']
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
