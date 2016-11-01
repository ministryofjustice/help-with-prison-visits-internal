const getClaim = require('../../services/data/get-individual-claim-details')
const getDateFormatted = require('../../views/helpers/date-helper')
const getClaimExpenseDetailFormatted = require('../../views/helpers/claim-expense-helper')
const getDisplayFieldName = require('../../views/helpers/display-field-names')
const ValidationError = require('../../services/errors/validation-error')
const ClaimDecision = require('../../services/domain/claim-decision')
const SubmitClaimResponse = require('../../services/data/submit-claim-response')

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
    try {
      var claimDecision = new ClaimDecision(req.body)
      SubmitClaimResponse(req.params.claimId, claimDecision)
        .then(function () {
          return res.redirect('/')
        })
    } catch (error) {
      if (error instanceof ValidationError) {
        getClaim(req.params.claimId)
          .then(function (data) {
            return res.status(400).render('./claim/view-claim', {
              title: 'APVS Claim',
              Claim: data.claim,
              Expenses: data.claimExpenses,
              getDateFormatted: getDateFormatted,
              getClaimExpenseDetailFormatted: getClaimExpenseDetailFormatted,
              getDisplayFieldName: getDisplayFieldName,
              claimDecision: req.body,
              errors: error.validationErrors
            })
          })
      } else {
        throw error
      }
    }
  })
}
