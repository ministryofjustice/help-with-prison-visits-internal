const authorisation = require('../services/authorisation')
const getClaimListForSearch = require('../services/data/get-claim-list-for-search')
const displayHelper = require('../views/helpers/display-helper')
const applicationRoles = require('../constants/application-roles-enum')
const allowedRoles = [
  applicationRoles.CLAIM_ENTRY_BAND_2,
  applicationRoles.CLAIM_PAYMENT_BAND_3,
  applicationRoles.CASEWORK_MANAGER_BAND_5,
  applicationRoles.BAND_9,
  applicationRoles.APPLICATION_DEVELOPER
]

module.exports = function (router) {
  router.get('/search', function (req, res) {
    authorisation.hasRoles(req, allowedRoles)
    const query = req.query.q
    return res.render('search', { query: query })
  })

  router.get('/search-results', function (req, res) {
    authorisation.hasRoles(req, allowedRoles)
    const searchQuery = req.query.q || ''

    if (!searchQuery) {
      return res.json({
        draw: 0,
        recordsTotal: 0,
        recordsFiltered: 0,
        claims: []
      })
    } else {
      getClaimListForSearch(searchQuery, parseInt(req.query.start), parseInt(req.query.length))
        .then(function (data) {
          const claims = data.claims

          claims.map(function (claim) {
            claim.ClaimTypeDisplayName = displayHelper.getClaimTypeDisplayName(claim.ClaimType)
            return claim
          })
          return res.json({
            draw: req.query.draw,
            recordsTotal: data.total.Count,
            recordsFiltered: data.total.Count,
            claims: claims
          })
        })
        .catch(function (error) {
          res.status(500).send(error)
        })
    }
  })
}
