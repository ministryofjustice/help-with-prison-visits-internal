const getClaim = require('../../services/data/get-individual-claim-details')
const getDateFormatted = require('../../views/helpers/date-helper')
const getClaimExpenseDetailFormatted = require('../../views/helpers/claim-expense-helper')
const getDisplayFieldName = require('../../views/helpers/display-field-names')

module.exports = function (router) {
  router.get('/claim/:claimId', function (req, res) {
    getClaim(req.params.claimId)
      .then(function (data) {
        return res.render('./claim/view-claim', {
          title: 'APVS Claim',
          Claim: data.claim,
          Expenses: data.claimExpenses,
          getDateFormatted: getDateFormatted,
          getClaimExpenseDetailFormatted: getClaimExpenseDetailFormatted,
          getDisplayFieldName: getDisplayFieldName
        })
      })
  })

  router.post('/claim/:claimId', function (req, res) {
    console.dir(req.body)
    return res.redirect(`/claim/${req.params.claimId}`)
  })
}
