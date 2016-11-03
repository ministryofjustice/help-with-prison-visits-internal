const getIndividualClaimDetails = require('../../services/data/get-individual-claim-details')
const getDateFormatted = require('../../views/helpers/date-helper')
const getClaimExpenseDetailFormatted = require('../../views/helpers/claim-expense-helper')
const getDisplayFieldName = require('../../views/helpers/display-field-names')
const ValidationError = require('../../services/errors/validation-error')
const ClaimDecision = require('../../services/domain/claim-decision')
const SubmitClaimResponse = require('../../services/data/submit-claim-response')
const getClaimExpenseResponses = require('../helpers/get-claim-expense-responses')
const prisonerRelationshipsEnum = require('../../constants/prisoner-relationships-enum')
const mergeClaimExpensesWithSubmittedResponses = require('../helpers/merge-claim-expenses-with-submitted-responses')

module.exports = function (router) {
  router.get('/claim/:claimId', function (req, res) {
    getIndividualClaimDetails(req.params.claimId)
      .then(function (data) {
        return res.render('./claim/view-claim', {
          title: 'APVS Claim',
          Claim: data.claim,
          Expenses: data.claimExpenses,
          getDateFormatted: getDateFormatted,
          getClaimExpenseDetailFormatted: getClaimExpenseDetailFormatted,
          getDisplayFieldName: getDisplayFieldName,
          prisonerRelationshipsEnum: prisonerRelationshipsEnum
        })
      })
  })

  router.post('/claim/:claimId', function (req, res) {
    try {
      var claimExpenses = getClaimExpenseResponses(req.body)
      var claimDecision = new ClaimDecision(req.body.decision, req.body.reasonRequest, req.body.reasonReject,
        req.body.additionalInfoApprove, req.body.additionalInfoRequest, req.body.additionalInfoReject, req.body.nomisCheck, claimExpenses)

      SubmitClaimResponse(req.params.claimId, claimDecision)
        .then(function () {
          return res.redirect('/')
        })
    } catch (error) {
      if (error instanceof ValidationError) {
        getIndividualClaimDetails(req.params.claimId)
          .then(function (data) {
            if (data.claim && data.claimExpenses) {
              data.claim.NomisCheck = req.body.nomisCheck
              data.claimExpenses = mergeClaimExpensesWithSubmittedResponses(data.claimExpenses, claimExpenses)
            }
            return res.status(400).render('./claim/view-claim', {
              title: 'APVS Claim',
              Claim: data.claim,
              Expenses: data.claimExpenses,
              getDateFormatted: getDateFormatted,
              getClaimExpenseDetailFormatted: getClaimExpenseDetailFormatted,
              getDisplayFieldName: getDisplayFieldName,
              prisonerRelationshipsEnum: prisonerRelationshipsEnum,
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
