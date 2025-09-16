const passport = require('passport')
const config = require('../../config')
const log = require('../services/log')

module.exports = router => {
  router.get('/logout', (req, res, next) => {
    log.info(req.user, 'logout')
    const redirectUrl = `${config.TOKEN_HOST}${config.LOGOUT_PATH}?client_id=${config.CLIENT_ID}&redirect_uri=${config.POST_LOGOUT_URL}`

    if (req.user) {
      req.logout(err => {
        if (err) return next(err)
        return req.session.destroy(() => res.redirect(redirectUrl))
      })
    } else res.redirect(redirectUrl)
  })

  router.get('/login', passport.authenticate('oauth2'))

  router.get('/login/callback', (req, res, next) =>
    passport.authenticate('oauth2', {
      successReturnToOrRedirect: req.session.returnTo || '/',
      failureRedirect: '/unauthorized',
    })(req, res, next),
  )

  router.get('/unauthorized', (req, res) => {
    log.info(req.user, 'unauthorized')
    return res.status(401).render('includes/error-401', { title: 'HwPV - unauthorized' })
  })
}
