const authorisation = require('../services/authorisation')
const getClaimListForSearch = require('../services/data/get-claim-list-for-search')
const displayHelper = require('../views/helpers/display-helper')

module.exports = function (router) {
  router.get('/search', function (req, res) {
    authorisation.isCaseworker(req)
    const query = req.query.q
    return res.render('search', { query: query })
  })

  router.get('/search-results', function (req, res) {
    authorisation.isCaseworker(req)
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
