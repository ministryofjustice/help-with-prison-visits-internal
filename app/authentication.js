const config = require('../config')
const session = require('express-session')
const redis = require('redis')
const passport = require('passport')
const OAuth2Strategy = require('passport-oauth2').Strategy
const axios = require('axios')
const RedisStore = require('connect-redis')(session)
const log = require('./services/log')
const applicationRoles = require('./constants/application-roles-enum')

module.exports = function (app) {
  if (config.AUTHENTICATION_ENABLED === 'true') {
    app.set('trust proxy', true)

    // Configure redis client
    const { HOST, PORT, PASSWORD } = config.REDIS
    const redisClient = redis.createClient({
      host: HOST,
      port: PORT,
      password: PASSWORD,
      tls: config.PRODUCTION ? {} : false
    })
    redisClient.on('error', function (err) {
      log.error('Could not establish a connection with redis. ' + err)
    })
    redisClient.on('connect', function () {
      log.info('Connected to redis successfully')
    })

    app.use(session({
      store: new RedisStore({ client: redisClient }),
      secret: config.HWPVCOOKIE.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      proxy: true,
      name: config.HWPVCOOKIE.NAME,
      cookie: {
        domain: config.HWPVCOOKIE.DOMAIN,
        httpOnly: true,
        maxAge: config.HWPVCOOKIE.EXPIRYMINUTES * 60 * 1000,
        sameSite: 'lax',
        secure: true,
        signed: true
      }
    }))

    app.use(passport.initialize())
    app.use(passport.session())

    passport.use(new OAuth2Strategy({
      authorizationURL: `${config.TOKEN_HOST}${config.AUTHORIZE_PATH}`,
      tokenURL: `${config.TOKEN_HOST}${config.TOKEN_PATH}`,
      clientID: config.CLIENT_ID,
      clientSecret: config.CLIENT_SECRET,
      callbackURL: config.REDIRECT_URI,
      state: true,
      customHeaders: {
        Authorization: `Basic ${Buffer.from(`${config.CLIENT_ID}:${config.CLIENT_SECRET}`).toString('base64')}`
      }
    },
    function (accessToken, refreshToken, params, profile, cb) {
      // Call API to get details on user
      const options = {
        uri: `${config.TOKEN_HOST}${config.USER_PATH_PREFIX}${config.USER_DETAILS_PATH}`,
        qs: { access_token: accessToken },
        json: true
      }
      axios(options, function (error, response, userDetails) {
        if (!error && response.statusCode === 200) {
          let roles = []
          options.uri = `${config.TOKEN_HOST}${config.USER_PATH_PREFIX}/${userDetails.username}${config.USER_EMAIL_PATH}`
          axios(options, function (error, response, userEmail) {
            if (!error && response.statusCode === 200) {
              options.uri = `${config.TOKEN_HOST}${config.USER_PATH_PREFIX}${config.USER_ROLES_PATH}`
              axios(options, function (error, response, userRoles) {
                if (!error && response.statusCode === 200) {
                  userRoles.forEach(function (role) {
                    roles = roles.concat(role.roleCode)
                  })

                  if (roles) {
                    const sessionUser = {
                      email: userEmail.email,
                      name: userDetails.name,
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
                  log.error({ error: error }, 'error returned when requesting user roles from SSO')
                  cb(error, null)
                }
              })
            } else {
              log.error({ error: error }, 'error returned when requesting user email from SSO')
              cb(error, null)
            }
          })
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
  }

  // Make user details available to the views
  app.use(function (req, res, next) {
    if (req.user) {
      req.user.assistedDigitalUrl = '/submit-claim-on-behalf-of-claimant'
      res.locals.user = req.user
    }
    next()
  })
}
