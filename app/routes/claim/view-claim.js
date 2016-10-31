const Claim = require('../../services/data/get-individual-claim-details')
const viewClaimDisplay = require('../../services/display-helpers/view-claim-display')

module.exports = function (router) {
  router.get('/claim/:claimId', function (req, res) {
    Claim.get(req.params.claimId)
      .then(function (data) {
        var claimDetails
        var claimExpenses
        ;[claimDetails, claimExpenses] = viewClaimDisplay.get(data.claim, data.claimExpenses)
        return res.render('./claim/view-claim', {
          title: 'APVS Claim',
          Claim: claimDetails,
          Expenses: claimExpenses
        })
      })
  })
}
