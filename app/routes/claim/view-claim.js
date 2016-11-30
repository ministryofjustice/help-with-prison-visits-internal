const authorisation = require('../../services/authorisation')
const getIndividualClaimDetails = require('../../services/data/get-individual-claim-details')
const getDateFormatted = require('../../views/helpers/date-helper')
const getClaimExpenseDetailFormatted = require('../../views/helpers/claim-expense-helper')
const getChildFormatted = require('../../views/helpers/child-helper')
const getDisplayFieldName = require('../../views/helpers/display-field-names')
const ValidationError = require('../../services/errors/validation-error')
const ValidationErrorMessages = require('../../services/validators/validation-error-messages')
const ClaimDecision = require('../../services/domain/claim-decision')
const SubmitClaimResponse = require('../../services/data/submit-claim-response')
const getClaimExpenseResponses = require('../helpers/get-claim-expense-responses')
const prisonerRelationshipsEnum = require('../../constants/prisoner-relationships-enum')
const receiptRequiredEnum = require('../../constants/receipt-required-enum')
const displayHelper = require('../../views/helpers/display-helper')
const mergeClaimExpensesWithSubmittedResponses = require('../helpers/merge-claim-expenses-with-submitted-responses')
const getLastUpdated = require('../../services/data/get-claim-last-updated')
const checkLastUpdated = require('../../services/check-last-updated')

module.exports = function (router) {
  router.get('/claim/:claimId', function (req, res) {
    authorisation.isCaseworker(req)

    getIndividualClaimDetails(req.params.claimId)
      .then(function (data) {
        return res.render('./claim/view-claim', {
          title: 'APVS Claim',
          Claim: data.claim,
          Expenses: data.claimExpenses,
          Children: data.claimChild,
          getDateFormatted: getDateFormatted,
          getClaimExpenseDetailFormatted: getClaimExpenseDetailFormatted,
          getChildFormatted: getChildFormatted,
          getDisplayFieldName: getDisplayFieldName,
          prisonerRelationshipsEnum: prisonerRelationshipsEnum,
          receiptRequiredEnum: receiptRequiredEnum,
          displayHelper: displayHelper,
          duplicates: data.duplicates,
          claimEvents: data.claimEvents
        })
      })
  })

  router.post('/claim/:claimId', function (req, res) {
    authorisation.isCaseworker(req)

    getLastUpdated(req.params.claimId).then(function (lastUpdatedData) {
      try {
        var updateConflict = checkLastUpdated(lastUpdatedData.LastUpdated, req.body.lastUpdated)
        if (updateConflict) {
          throw new ValidationError({UpdateConflict: [ValidationErrorMessages.getUpdateConflict(lastUpdatedData.Status)]})
        }
        var claimExpenses = getClaimExpenseResponses(req.body)
        var claimDecision = new ClaimDecision(
          req.user.email,
          req.body.assistedDigitalCaseworker,
          req.body.decision,
          req.body.reasonRequest,
          req.body.reasonReject,
          req.body.additionalInfoApprove,
          req.body.additionalInfoRequest,
          req.body.additionalInfoReject,
          req.body.nomisCheck,
          req.body.dwpCheck,
          req.body.visitConfirmationCheck,
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
              if (data.claim && data.claimExpenses && !updateConflict) {
                data.claim.NomisCheck = req.body.nomisCheck
                data.claim.DWPCheck = req.body.dwpCheck
                data.claim.VisitConfirmationCheck = req.body.visitConfirmationCheck
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
                displayHelper: displayHelper,
                claimDecision: req.body,
                errors: error.validationErrors
              })
            })
        } else {
          throw error
        }
      }
    })
  })

  router.get('/claim/:claimId/download', function (req, res) {
    authorisation.isCaseworker(req)

    var path = req.query.path
    if (path) {
      res.download(path)
    } else {
      throw new Error('No path to file provided')
    }
  })
}
