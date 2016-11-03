const getClaim = require('../../services/data/get-individual-claim-details')
const getDateFormatted = require('../../views/helpers/date-helper')
const getClaimExpenseDetailFormatted = require('../../views/helpers/claim-expense-helper')
const getDisplayFieldName = require('../../views/helpers/display-field-names')
const ValidationError = require('../../services/errors/validation-error')
const ClaimDecision = require('../../services/domain/claim-decision')
const SubmitClaimResponse = require('../../services/data/submit-claim-response')
const getClaimExpenseResponses = require('../helpers/get-claim-expense-responses')
const prisonerRelationshipsEnum = require('../../constants/prisoner-relationships-enum')

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
        getClaim(req.params.claimId)
          .then(function (data) {
            // TODO move to route helper and test

            data.claim.NomisCheck = req.body.nomisCheck

            if (data.claimExpenses) {
              var claimExpensesById = {}
              claimExpenses.forEach(function (claimExpense) {
                claimExpensesById[claimExpense.claimExpenseId] = claimExpense
              })
              data.claimExpenses.forEach(function (expense) {
                var postedClaimExpenseResponse = claimExpensesById[expense.ClaimExpenseId.toString()]
                expense.Status = postedClaimExpenseResponse.status
                if (expense.Status === 'APPROVED-DIFF-AMOUNT') {
                  expense.ApprovedCost = postedClaimExpenseResponse.approvedCost
                  if (postedClaimExpenseResponse.approvedCost === '') {
                    expense.Error = true
                  }
                }
              })
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
