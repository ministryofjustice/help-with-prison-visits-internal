const config = require('../../config')
const passport = require('passport')
const log = require('../services/log')

module.exports = function (router) {
  router.get('/logout', function (req, res) {
    log.info({ user: req.user }, 'logout')
    req.logout()
    res.redirect(`${config.TOKEN_HOST}${config.LOGOUT_PATH}`)
  })

  router.get('/login', passport.authenticate('oauth2'))

  router.get('/login/callback', passport.authenticate('oauth2', { failureRedirect: '/unauthorized' }),
    function (req, res) {
      // Successful authentication, redirect home.
      log.info({ user: req.user }, 'login')
      return res.redirect('/')
    })

  router.get('/unauthorized', function (req, res) {
    log.info({ user: req.user }, 'unauthorized')
    return res.status(401).render('includes/error-401', { title: 'HwPV - unauthorized' })
  })
}
