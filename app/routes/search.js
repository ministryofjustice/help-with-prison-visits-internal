const authorisation = require('../services/authorisation')
const getClaimListForSearch = require('../services/data/get-claim-list-for-search')
const displayHelper = require('../views/helpers/display-helper')
const log = require('../services/log')

module.exports = function (router) {
  router.get('/search', function (req, res) {
    authorisation.isCaseworker(req)
    var query = req.query.q

    log.info('search GET')
    log.info(query)

    return res.render('search', { query: query })
  })

  router.get('/search-results', function (req, res) {
    authorisation.isCaseworker(req)
    var searchQuery = req.query.q || ''

    log.info('search-results GET')
    log.info(searchQuery)

    if (!searchQuery) {
      log.info('search-results IF')

      return res.json({
        draw: 0,
        recordsTotal: 0,
        recordsFiltered: 0,
        claims: []
      })
    } else {
      log.info('search-results ELSE')

      getClaimListForSearch(searchQuery, parseInt(req.query.start), parseInt(req.query.length))
        .then(function (data) {
          var claims = data.claims

          log.info('search-results ELSE getClaimListForSearch')
          log.info(claims)

          claims.map(function (claim) {
            claim.ClaimTypeDisplayName = displayHelper.getClaimTypeDisplayName(claim.ClaimType)
          })

          log.info('search-results ELSE getClaimListForSearch MAP')

          return res.json({
            draw: req.query.draw,
            recordsTotal: data.total.Count,
            recordsFiltered: data.total.Count,
            claims: claims
          })
        })
      .catch(function (error) {
        log.info('search-results ELSE getClaimListForSearch ERROR')
        res.status(500).send(error)
      })
    }
  })
}
