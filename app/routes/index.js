const claims = require('../services/data/get-claim-list-and-count')

module.exports = function (router) {
  router.get('/', function (req, res) {
    res.render('index', {
      title: 'APVS index'
    })
  })

  router.get('/claims/:status', function (req, res) {
    claims.getClaimsListAndCount(req.params.status, parseInt(req.query.start), parseInt(req.query.length))
      .then(function (data) {
        return res.json({
          draw: req.query.draw,
          recordsTotal: data.total.Count,
          recordsFiltered: data.total.Count,
          claims: data.claims})
      })
  })
}
