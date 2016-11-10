const getIndividualClaimDetails = require('../../services/data/get-individual-claim-details')
const getDateFormatted = require('../../views/helpers/date-helper')
const getClaimExpenseDetailFormatted = require('../../views/helpers/claim-expense-helper')
const getDisplayFieldName = require('../../views/helpers/display-field-names')
const ValidationError = require('../../services/errors/validation-error')
const ClaimDecision = require('../../services/domain/claim-decision')
const SubmitClaimResponse = require('../../services/data/submit-claim-response')
const getClaimExpenseResponses = require('../helpers/get-claim-expense-responses')
const prisonerRelationshipsEnum = require('../../constants/prisoner-relationships-enum')
const benefitsEnum = require('../../constants/benefits-enum')
const mergeClaimExpensesWithSubmittedResponses = require('../helpers/merge-claim-expenses-with-submitted-responses')

module.exports = function (router) {
  router.get('/claim/:claimId', function (req, res) {
    getIndividualClaimDetails(req.params.claimId)
      .then(function (data) {
        return res.render('./claim/view-claim', {
          title: 'APVS Claim',
          Claim: data.claim,
          Expenses: data.claimExpenses,
          Children: data.claimChild,
          getDateFormatted: getDateFormatted,
          getClaimExpenseDetailFormatted: getClaimExpenseDetailFormatted,
          getDisplayFieldName: getDisplayFieldName,
          prisonerRelationshipsEnum: prisonerRelationshipsEnum,
          benefitsEnum: benefitsEnum
        })
      })
  })

  router.post('/claim/:claimId', function (req, res) {
    try {
      var claimExpenses = getClaimExpenseResponses(req.body)
      var claimDecision = new ClaimDecision(
        req.body.decision,
        req.body.reasonRequest,
        req.body.reasonReject,
        req.body.additionalInfoApprove,
        req.body.additionalInfoRequest,
        req.body.additionalInfoReject,
        req.body.nomisCheck,
        req.body.dwpCheck,
        claimExpenses
      )

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
              data.claim.DWPCheck = req.body.dwpCheck
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
              benefitsEnum: benefitsEnum,
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
