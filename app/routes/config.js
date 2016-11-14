const authorisation = require('../services/authorisation')

module.exports = function (router) {
  router.get('/config', function (req, res) {
    authorisation.isAdmin(req)

    res.render('config', {
      title: 'APVS Configuration'
    })
  })
}
