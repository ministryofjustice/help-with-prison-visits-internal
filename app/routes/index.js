const claims = require('../services/data/get-claims-by-status')
const moment = require('moment')

module.exports = function (router) {
  router.get('/', function (req, res) {
    claims.get('New')
      .then(function (data) {
        data.forEach(function (claim) {
          claim.DateSubmitted = moment(claim.DateSubmitted).format('DD-MM-YYYY HH:MM')
        })
        return res.render('index', {
          title: 'APVS index',
          claims: data
        })
      })
  })

  router.get('/claims', function (req, res) {
    claims.get('New')
      .then(function (data) {
        data.forEach(function (claim) {
          claim.DateSubmitted = moment(claim.DateSubmitted).format('DD-MM-YYYY HH:MM')
          claim.Name = claim.FirstName + ' ' + claim.LastName
        })
        return res.json({claims: data})
      })
  })
}
