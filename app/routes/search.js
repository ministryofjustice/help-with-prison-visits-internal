const authorisation = require('../services/authorisation')
const getClaimListForSearch = require('../services/data/get-claim-list-for-search')
const displayHelper = require('../views/helpers/display-helper')
const exportSearchResults = require('../services/export-search-results')

module.exports = function (router) {
  router.get('/search', function (req, res) {
    authorisation.isCaseworker(req)
    var query = req.query.q

    return res.render('search', { query: query })
  })

  router.get('/search-results', function (req, res) {
    authorisation.isCaseworker(req)
    var searchQuery = req.query.q || ''
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
          var claims = data.claims
          claims.map(function (claim) {
            claim.ClaimTypeDisplayName = displayHelper.getClaimTypeDisplayName(claim.ClaimType)
          })

          return res.json({
            draw: req.query.draw,
            recordsTotal: data.total.Count,
            recordsFiltered: data.total.Count,
            claims: claims
          })
        })
    }
  })

  router.get('/export-search-results', function (req, res) {
    authorisation.isCaseworker(req)

    res.set('Content-Type', 'text/csv')
    res.set('Content-Disposition', 'attachment; filename="claims.csv"')

    return exportSearchResults('')
      .then(function (csvString) {
        res.write(csvString)
        res.end()
      })
  })
}


