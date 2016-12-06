const authorisation = require('../services/authorisation')
const getAutoApprovalConfig = require('../services/data/get-auto-approval-config')
// const updateAutoApprovalConfig = require('../services/data/update-auto-approval-config')

module.exports = function (router) {
  router.get('/config', function (req, res) {
    authorisation.isAdmin(req)

    getAutoApprovalConfig()
      .then(function (autoApprovalConfig) {
        res.render('config', {
          title: 'APVS Configuration',
          autoApprovalConfig: autoApprovalConfig
        })
      })
  })

  router.post('/config', function (req, res) {
    authorisation.isAdmin(req)

    console.dir(req.body)

    // TODO: construct domain object and check for validation errors

    // TODO: persist in db
    // updateAutoApprovalConfig()

    res.redirect('/config')
  })
}
