const authorisation = require('../services/authorisation')
const getClaimListForSearch = require('../services/data/get-claim-list-for-search')
const displayHelper = require('../views/helpers/display-helper')
const applicationRoles = require('../constants/application-roles-enum')

const allowedRoles = [
  applicationRoles.CLAIM_ENTRY_BAND_2,
  applicationRoles.CLAIM_PAYMENT_BAND_3,
  applicationRoles.CASEWORK_MANAGER_BAND_5,
  applicationRoles.BAND_9,
]

module.exports = router => {
  router.get('/search', (req, res) => {
    authorisation.hasRoles(req, allowedRoles)
    const query = req.query?.q
    return res.render('search', { query })
  })

  router.get('/search-results', (req, res) => {
    authorisation.hasRoles(req, allowedRoles)
    const searchQuery = req.query?.q || ''

    if (!searchQuery) {
      return res.json({
        draw: 0,
        recordsTotal: 0,
        recordsFiltered: 0,
        claims: [],
      })
    }
    return getClaimListForSearch(searchQuery, parseInt(req.query?.start, 10), parseInt(req.query?.length, 10))
      .then(data => {
        const { claims } = data

        claims.map(claim => {
          claim.ClaimTypeDisplayName = displayHelper.getClaimTypeDisplayName(claim.ClaimType)
          return claim
        })
        return res.json({
          draw: req.query?.draw,
          recordsTotal: data.total.Count,
          recordsFiltered: data.total.Count,
          claims,
        })
      })
      .catch(error => {
        res.status(500).send(error)
      })
  })
}
