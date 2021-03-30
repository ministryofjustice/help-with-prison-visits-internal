const authorisation = require('../services/authorisation')
const applicationRoles = require('../constants/application-roles-enum')
const config = require('../../config')
const allowedRoles = [
  applicationRoles.CLAIM_ENTRY_BAND_2
]

module.exports = function (router) {
  router.get('/submit-claim-on-behalf-of-claimant', function (req, res) {
    authorisation.hasRoles(req, allowedRoles)

    res.redirect(`${config.EXTERNAL_SERVICE_URL}/assisted-digital?caseworker=${req.user.email}`)
  })
}
