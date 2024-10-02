const config = require('../config')
const session = require('express-session')
const redis = require('redis')
const passport = require('passport')
const OAuth2Strategy = require('passport-oauth2').Strategy
const axios = require('axios')
const log = require('./services/log')
const applicationRoles = require('./constants/application-roles-enum')

const RedisStore = require('connect-redis').default

const url =
  config.PRODUCTION
    ? `rediss://${config.REDIS.HOST}:${config.REDIS.PORT}`
    : `redis://${config.REDIS.HOST}:${config.REDIS.PORT}`

const createRedisClient = ({ legacyMode }) => {
  const client = redis.createClient({
    url,
    password: config.REDIS.PASSWORD,
    legacyMode,
    socket: {
      reconnectStrategy: (attempts) => {
        // Exponential back off: 20ms, 40ms, 80ms..., capped to retry every 30 seconds
        const nextDelay = Math.min(2 ** attempts * 20, 30000)
        log.info(`Retry Redis connection attempt: ${attempts}, next attempt in: ${nextDelay}ms`)
        return nextDelay
      }
    }
  })

  client.on('error', (e) => log.error('Redis client error', e))

  return client
}

module.exports = function (app) {
  if (config.AUTHENTICATION_ENABLED === 'true') {
    const client = createRedisClient({ legacyMode: true })
    client.connect().catch((err) => log.error('Error connecting to Redis', err))

    app.set('trust proxy', true)

    app.use(session({
      store: new RedisStore({ client }),
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
        secure: config.PRODUCTION,
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
    function (accessToken, refreshToken, params, profile, done) {
      // Call API to get details on user
      const options = {
        url: `${config.MANAGE_USERS_HOST}${config.MANAGE_USER_PATH_PREFIX}${config.MANAGE_USER_DETAILS_PATH}`,
        headers: `Authorization: Bearer ${accessToken}`
      }
      axios(options)
        .then(function (response) {
          if (response.status === 200) {
            let roles = []
            const userDetails = response.data
            options.url = `${config.MANAGE_USERS_HOST}${config.MANAGE_USER_PATH_PREFIX}/${userDetails.username}${config.MANAGE_USER_EMAIL_PATH}`

            axios(options)
              .then(function (response) {
                if (response.status === 200) {
                  const userEmail = response.data
                  options.url = `${config.MANAGE_USERS_HOST}${config.MANAGE_USER_PATH_PREFIX}${config.MANAGE_USER_ROLES_PATH}`

                  axios(options)
                    .then(function (response) {
                      if (response.status === 200) {
                        const userRoles = response.data
                        userRoles.forEach(function (role) {
                          roles = roles.concat(role.roleCode)
                        })

                        if (roles) {
                          const sessionUser = {
                            email: userEmail.email,
                            name: userDetails.name,
                            activeCaseLoadId: userDetails.activeCaseLoadId,
                            username: userDetails.username,
                            roles
                          }
                          done(null, sessionUser)
                        } else {
                          log.error('no roles found for user')
                          const notAuthorisedError = new Error('You are not authorised for this service')
                          notAuthorisedError.status = 403
                          done(notAuthorisedError, null)
                        }
                      }
                    })
                    .catch(function (error) {
                      log.error({ error }, 'error returned when requesting user roles from SSO')
                      done(error, null)
                    })
                }
              })
              .catch(function (error) {
                log.error({ error }, 'error returned when requesting user email from SSO')
                done(error, null)
              })
          }
        })
        .catch(function (error) {
          log.error({ error }, 'error returned when requesting user details from SSO')
          done(error, null)
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
        activeCaseLoadId: '12',
        username: 'aadams',
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
