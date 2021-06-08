const config = require('../../config')
const passport = require('passport')
const log = require('../services/log')

module.exports = function (router) {
  router.get('/logout', function (req, res) {
    log.info({ user: req.user }, 'logout')
    req.logout()
    return res.redirect(`${config.TOKEN_HOST}${config.LOGOUT_PATH}`)
  })

  router.get('/auth/:provider', passport.authenticate('oauth2'))

  router.get('/auth/:provider/callback', passport.authenticate('oauth2', { failureRedirect: '/unauthorised' }),
    function (req, res) {
      // Successful authentication, redirect home.
      log.info({ user: req.user }, 'login')
      return res.redirect('/')
    })

  router.get('/unauthorised', function (req, res) {
    log.info({ user: req.user }, 'unauthorised')
    return res.status(401).render('includes/error-401', { title: 'HwPV - unauthorised' })
  })
}
