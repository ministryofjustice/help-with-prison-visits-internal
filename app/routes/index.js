const claims = require('../services/data/get-claims-by-status')
const moment = require('moment')

module.exports = function (router) {
  router.get('/', function (req, res) {
    res.render('index', {
      title: 'APVS index'
    })
  })

  router.get('/claims/:status', function (req, res) {
    var recordsTotal
    var status = req.params.status
    claims.count(status).then(function (total) {
      recordsTotal = total.Count
    })
    claims.get(status, parseInt(req.query.start), parseInt(req.query.length))
      .then(function (data) {
        data.forEach(function (claim) {
          claim.DateSubmitted = moment(claim.DateSubmitted).format('DD-MM-YYYY HH:MM')
          claim.Name = claim.FirstName + ' ' + claim.LastName
        })
        return res.json({
          draw: req.query.draw,
          recordsTotal: recordsTotal,
          recordsFiltered: recordsTotal,
          claims: data})
      })
  })
}
