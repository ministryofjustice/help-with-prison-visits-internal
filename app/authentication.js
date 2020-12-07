const config = require('../config')
const session = require('express-session')
const passport = require('passport')
const OAuth2Strategy = require('passport-oauth2').Strategy
const request = require('request')
const log = require('./services/log')

module.exports = function (app) {
  if (config.AUTHENTICATION_ENABLED === 'true') {
    // Using local session storage
    const sessionOptions = {
      secret: config.SESSION_SECRET,
      cookie: {}
    }

    if (app.get('env') === 'production') {
      log.info('using production settings')
      app.set('trust proxy', true)
      sessionOptions.proxy = true
      sessionOptions.cookie.secure = true
    }

    app.use(session(sessionOptions))

    app.use(passport.initialize())
    app.use(passport.session())

    passport.use(new OAuth2Strategy({
      authorizationURL: config.TOKEN_HOST + config.AUTHORIZE_PATH,
      tokenURL: config.TOKEN_HOST + config.TOKEN_PATH,
      clientID: config.CLIENT_ID,
      clientSecret: config.CLIENT_SECRET,
      callbackURL: config.REDIRECT_URI
    },
    function (accessToken, refreshToken, profile, cb) {
      // Call API to get details on user
      const options = {
        uri: config.TOKEN_HOST + config.USER_DETAILS_PATH,
        qs: { access_token: accessToken },
        json: true
      }
      request(options, function (error, response, userDetails) {
        if (!error && response.statusCode === 200) {
          let roles = []

          userDetails.permissions.forEach(function (permission) {
            roles = roles.concat(permission.roles)
          })

          if (roles) {
            const sessionUser = {
              email: userDetails.email,
              first_name: userDetails.first_name,
              last_name: userDetails.last_name,
              roles: roles
            }
            cb(null, sessionUser)
          } else {
            log.error('no roles found for user')
            const notAuthorisedError = new Error('You are not authorised for this service')
            notAuthorisedError.status = 403
            cb(notAuthorisedError, null)
          }
        } else {
          log.error({ error: error }, 'error returned when requesting user details from SSO')
          cb(error, null)
        }
      })
    }))
    passport.serializeUser(function (user, done) {
      done(null, user)
    })
    passport.deserializeUser(function (user, done) {
      done(null, user)
    })
  } else {
    app.use(function (req, res, next) {
      req.user = {
        email: 'test@test.com',
        first_name: 'Andrew',
        last_name: 'Adams',
        roles: ['caseworker', 'admin', 'sscl']
      }
      next()
    })
  }

  // Make user details available to the views
  app.use(function (req, res, next) {
    if (req.user) {
      req.user.assistedDigitalUrl = `${config.EXTERNAL_SERVICE_URL}/assisted-digital?caseworker=${req.user.email}`
      res.locals.user = req.user
    }
    next()
  })
}
