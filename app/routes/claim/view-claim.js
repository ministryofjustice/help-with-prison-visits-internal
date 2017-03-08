const authorisation = require('../../services/authorisation')
const getIndividualClaimDetails = require('../../services/data/get-individual-claim-details')
const getClaimDocumentFilePath = require('../../services/data/get-claim-document-file-path')
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
const insertDeduction = require('../../services/data/insert-deduction')
const disableDeduction = require('../../services/data/disable-deduction')
const ClaimDeduction = require('../../services/domain/claim-deduction')
const updateClaimOverpaymentStatus = require('../../services/data/update-claim-overpayment-status')
const OverpaymentResponse = require('../../services/domain/overpayment-response')
const closeAdvanceClaim = require('../../services/data/close-advance-claim')
const updateEligibilityTrustedStatus = require('../../services/data/update-eligibility-trusted-status')
const requestNewBankDetails = require('../../services/data/request-new-bank-details')
const claimDecisionEnum = require('../../../app/constants/claim-decision-enum')
const unassignClaimsAfterTimePeriod = require('../../services/data/unassign-claims-after-time-period')
const updateAssignmentOfClaims = require('../../services/data/update-assignment-of-claims')
const Promise = require('bluebird')

var claimExpenses

module.exports = function (router) {
  // GET
  router.get('/claim/:claimId', function (req, res) {
    authorisation.isCaseworker(req)
    unassignClaimsAfterTimePeriod()
      .then(function () {
        return renderViewClaimPage(req.params.claimId, req, res)
      })
  })

  router.get('/claim/:claimId/download', function (req, res, next) {
    authorisation.isCaseworker(req)

    return Promise.try(function () {
      var claimDocumentId = req.query['claim-document-id']
      if (!claimDocumentId) {
        throw new Error('Invalid Document ID')
      }

      return getClaimDocumentFilePath(claimDocumentId)
        .then(function (document) {
          if (document && document.Filepath) {
            res.download(document.Filepath)
          } else {
            throw new Error('No path to file provided')
          }
        })
    })
    .catch(function (err) {
      return handleError(err, req, res, false, next)
    })
  })

  // POST
  router.post('/claim/:claimId', function (req, res, next) {
    return validatePostRequest(req, res, next, `/`, function () {
      claimExpenses = getClaimExpenseResponses(req.body)
      return submitClaimDecision(req, res, claimExpenses)
    })
  })

  router.post('/claim/:claimId/add-deduction', function (req, res, next) {
    return validatePostRequest(req, res, next, `/claim/${req.params.claimId}`, function () {
      var deductionType = req.body.deductionType
      var amount = Number(req.body.deductionAmount).toFixed(2)
      var claimDeduction = new ClaimDeduction(deductionType, amount)
      claimExpenses = getClaimExpenseResponses(req.body)

      return insertDeduction(req.params.claimId, claimDeduction)
        .then(function () {
          return true
        })
    })
  })

  router.post('/claim/:claimId/remove-deduction', function (req, res, next) {
    return validatePostRequest(req, res, next, `/claim/${req.params.claimId}`, function () {
      var removeDeductionId = getClaimDeductionId(req.body)

      return disableDeduction(removeDeductionId)
        .then(function () {
          return true
        })
    })
  })

  router.post('/claim/:claimId/update-overpayment-status', function (req, res, next) {
    return validatePostRequest(req, res, next, `/claim/${req.params.claimId}`, function () {
      return getIndividualClaimDetails(req.params.claimId)
        .then(function (data) {
          var claim = data.claim

          var overpaymentAmount = req.body['overpayment-amount']
          var overpaymentRemaining = req.body['overpayment-remaining']
          var overpaymentReason = req.body['overpayment-reason']

          var overpaymentResponse = new OverpaymentResponse(overpaymentAmount, overpaymentRemaining, overpaymentReason, claim.IsOverpaid)

          return updateClaimOverpaymentStatus(claim, overpaymentResponse)
        })
    })
  })

  router.post('/claim/:claimId/close-advance-claim', function (req, res, next) {
    return validatePostRequest(req, res, next, `/claim/${req.params.claimId}`, function () {
      return closeAdvanceClaim(req.params.claimId, req.body['close-advance-claim-reason'])
    })
  })

  router.post('/claim/:claimId/request-new-payment-details', function (req, res, next) {
    return validatePostRequest(req, res, next, `/claim/${req.params.claimId}`, function () {
      return getIndividualClaimDetails(req.params.claimId)
        .then(function (data) {
          return requestNewBankDetails(data.claim.Reference, data.claim.EligibilityId, req.params.claimId, req.body['payment-details-additional-information'], req.user.email)
        })
    })
  })

  router.post('/claim/:claimId/assign-self', function (req, res, next) {
    return validatePostRequest(req, res, next, `/claim/${req.params.claimId}`, function () {
      return updateAssignmentOfClaims(req.params.claimId, req.user.email)
        .then(function () {
          return false
        })
    })
  })
}

 // Functions
function getClaimDeductionId (requestBody) {
  var deductionId = null
  Object.keys(requestBody).forEach(function (key) {
    if (key.indexOf('remove-deduction') > -1) {
      deductionId = key.substring(key.lastIndexOf('-') + 1)
    }
  })

  return deductionId
}

function validatePostRequest (req, res, next, redirectUrl, postFunction) {
  authorisation.isCaseworker(req)
  var updateConflict = true

  return Promise.try(function () {
    return checkForUpdateConflict(req.params.claimId, req.body.lastUpdated).then(function (hasConflict) {
      updateConflict = hasConflict

      return postFunction()
        .then(function (keepUnsubmittedChanges) {
          if (keepUnsubmittedChanges) {
            return renderViewClaimPage(req.params.claimId, req, res, keepUnsubmittedChanges)
          } else {
            return res.redirect(redirectUrl)
          }
        })
    })
  })
  .catch(function (error) {
    return handleError(error, req, res, updateConflict, next)
  })
}

function submitClaimDecision (req, res, claimExpenses) {
  var claimDecision = new ClaimDecision(
    req.user.email,
    req.body.assistedDigitalCaseworker,
    req.body.decision,
    req.body.additionalInfoApprove,
    req.body.additionalInfoRequest,
    req.body.additionalInfoReject,
    req.body.nomisCheck,
    req.body.dwpCheck,
    req.body.visitConfirmationCheck,
    claimExpenses
  )
  return SubmitClaimResponse(req.params.claimId, claimDecision)
    .then(function () {
      if (claimDecision.decision === claimDecisionEnum.APPROVED) {
        var isTrusted = req.body['is-trusted'] === 'on'
        var untrustedReason = req.body['untrusted-reason']

        return updateEligibilityTrustedStatus(req.params.claimId, isTrusted, untrustedReason)
      }
    })
}

function checkForUpdateConflict (claimId, currentLastUpdated) {
  return getLastUpdated(claimId).then(function (lastUpdatedData) {
    var updateConflict = checkLastUpdated(lastUpdatedData.LastUpdated, currentLastUpdated)
    if (updateConflict) {
      throw new ValidationError({UpdateConflict: [ValidationErrorMessages.getUpdateConflict(lastUpdatedData.Status)]})
    }
  })
}

function renderViewClaimPage (claimId, req, res, keepUnsubmittedChanges) {
  return getIndividualClaimDetails(claimId)
    .then(function (data) {
      if (keepUnsubmittedChanges) {
        populateNewData(data, req)
      }
      var error = {ValidationError: null}
      return res.render('./claim/view-claim', renderValues(data, req, error))
    })
}

function handleError (error, req, res, updateConflict, next) {
  if (error instanceof ValidationError) {
    return getIndividualClaimDetails(req.params.claimId)
      .then(function (data) {
        if (data.claim && data.claimExpenses && !updateConflict && claimExpenses) {
          populateNewData(data, req)
        }
        return res.status(400).render('./claim/view-claim', renderValues(data, req, error))
      })
  } else {
    next(error)
  }
}

function populateNewData (data, req) {
  data.claim.NomisCheck = req.body.nomisCheck
  data.claim.DWPCheck = req.body.dwpCheck
  data.claim.VisitConfirmationCheck = req.body.visitConfirmationCheck
  data.claimExpenses = mergeClaimExpensesWithSubmittedResponses(data.claimExpenses, claimExpenses)
}

function renderValues (data, req, error) {
  return {
    title: 'APVS Claim',
    Claim: data.claim,
    Expenses: data.claimExpenses,
    Children: data.claimChild,
    Escort: data.claimEscort,
    getDateFormatted: getDateFormatted,
    getChildFormatted: getChildFormatted,
    getClaimExpenseDetailFormatted: getClaimExpenseDetailFormatted,
    getDisplayFieldName: getDisplayFieldName,
    prisonerRelationshipsEnum: prisonerRelationshipsEnum,
    displayHelper: displayHelper,
    claimDecision: req.body,
    receiptRequiredEnum: receiptRequiredEnum,
    deductions: data.deductions,
    duplicates: data.duplicates,
    claimEvents: data.claimEvents,
    overpaidClaims: data.overpaidClaims,
    claimDecisionEnum: claimDecisionEnum,
    errors: error.validationErrors
  }
}
