const Claim = require('../../services/data/get-individual-claim-details')
const moment = require('moment')

module.exports = function (router) {
  router.get('/claim/:ClaimID', function (req, res) {
    Claim.get(req.params.ClaimID)
      .then(function (data) {
        data.DateSubmitted = moment(data.DateSubmitted).format('DD-MM-YYYY')
        data.DateOfBirth = moment(data.DateOfBirth).format('DD-MM-YYYY')
        return res.render('./claim/view-claim', {
          title: 'APVS Claim',
          Claim: data
        })
      })
  })
}
