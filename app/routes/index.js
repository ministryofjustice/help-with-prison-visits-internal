const claims = require('../services/data/get-claims-by-status')
const moment = require('moment')

module.exports = function (router) {
  router.get('/', function (req, res) {
    data = claims.get('New')
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
}
