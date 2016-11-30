const authorisation = require('../services/authorisation')
const getClaimsListAndCount = require('../services/data/get-claim-list-and-count')
const displayHelper = require('../views/helpers/display-helper')

module.exports = function (router) {
  router.get('/', function (req, res) {
    authorisation.isCaseworker(req)

    res.render('index', {
      title: 'APVS index',
      active: req.query.status
    })
  })

  router.get('/claims/:status', function (req, res) {
    authorisation.isCaseworker(req)

    getClaimsListAndCount(req.params.status, parseInt(req.query.start), parseInt(req.query.length))
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
  })
}
