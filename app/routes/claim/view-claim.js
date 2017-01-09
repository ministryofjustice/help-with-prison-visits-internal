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
const Promise = require('bluebird')

var claimExpenses

module.exports = function (router) {
  router.get('/claim/:claimId', function (req, res) {
    authorisation.isCaseworker(req)

    renderViewClaimPage(req.params.claimId, res)
  })

  router.post('/claim/:claimId', function (req, res) {
    authorisation.isCaseworker(req)

    var updateConflict

    return Promise.try(function () {
      return getLastUpdated(req.params.claimId).then(function (lastUpdatedData) {
        updateConflict = checkLastUpdated(lastUpdatedData.LastUpdated, req.body.lastUpdated)
        if (updateConflict) {
          throw new ValidationError({UpdateConflict: [ValidationErrorMessages.getUpdateConflict(lastUpdatedData.Status)]})
        }

        var removeDeductionId = getClaimDeductionId(req.body)
        var removeDeductionClicked = false

        if (removeDeductionId) {
          removeDeductionClicked = true
        }

        if (req.body['add-deduction']) {
          return addDeduction(req, res)
        } else if (removeDeductionClicked) {
          return removeDeduction(req, res, removeDeductionId)
        } else {
          claimExpenses = getClaimExpenseResponses(req.body)
          return submitClaimDecision(req, res, claimExpenses)
        }
      })
    })
    .catch(function (error) {
      if (error instanceof ValidationError) {
        return getIndividualClaimDetails(req.params.claimId)
          .then(function (data) {
            if (data.claim && data.claimExpenses && !updateConflict) {
              data.claim.NomisCheck = req.body.nomisCheck
              data.claim.DWPCheck = req.body.dwpCheck
              data.claim.VisitConfirmationCheck = req.body.visitConfirmationCheck
              data.claimExpenses = mergeClaimExpensesWithSubmittedResponses(data.claimExpenses, claimExpenses)
            }
            return renderErrors(data, req, res, error)
          })
      } else {
        throw error
      }
    })
  })

  router.get('/claim/:claimId/download', function (req, res) {
    authorisation.isCaseworker(req)

    var claimDocumentId = req.query['claim-document-id']
    if (!claimDocumentId) {
      throw new Error('Invalid Document ID')
    }

    getClaimDocumentFilePath(claimDocumentId)
      .then(function (document) {
        if (document && document.Filepath) {
          res.download(document.Filepath)
        } else {
          throw new Error('No path to file provided')
        }
      })
  })

  router.post('/claim/:claimId/closed-claim-action', function (req, res) {
    authorisation.isCaseworker(req)

    var updateConflict

    return Promise.try(function () {
      return getLastUpdated(req.params.claimId).then(function (lastUpdatedData) {
        updateConflict = checkLastUpdated(lastUpdatedData.LastUpdated, req.body.lastUpdated)
        if (updateConflict) {
          throw new ValidationError({UpdateConflict: [ValidationErrorMessages.getUpdateConflict(lastUpdatedData.Status)]})
        }

        if (req.body['closed-claim-action'] === 'OVERPAYMENT') {
          updateOverpaymentStatus(req, res)
        } else if (req.body['closed-claim-action'] === 'CLOSE-ADVANCE-CLAIM') {
          setAdvanceClaimStatusToClosed(req, res)
        } else if (req.body['closed-claim-action'] === 'REQUEST-NEW-PAYMENT-DETAILS') {
          requestNewPaymentDetails(req, res)
        }
      })
    })
    .catch(function (error) {
      if (error instanceof ValidationError) {
        return getIndividualClaimDetails(req.params.claimId)
          .then(function (data) {
            return renderErrors(data, req, res, error)
          })
      } else {
        throw error
      }
    })
  })
}

function removeDeduction (req, res, deductionId) {
  return disableDeduction(deductionId)
    .then(function () {
      return res.redirect(`/claim/${req.params.claimId}`)
    })
}

function getClaimDeductionId (requestBody) {
  var deductionId = null
  Object.keys(requestBody).forEach(function (key) {
    if (key.indexOf('remove-deduction') > -1) {
      deductionId = key.substring(key.lastIndexOf('-') + 1)
    }
  })

  return deductionId
}

function addDeduction (req, res) {
  var deductionType = req.body.deductionType
  var amount = req.body.deductionAmount
  var claimDeduction = new ClaimDeduction(deductionType, amount)

  return insertDeduction(req.params.claimId, claimDeduction)
    .then(function () {
      return res.redirect(`/claim/${req.params.claimId}`)
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
    .then(function () {
      return res.redirect('/')
    })
}

function updateOverpaymentStatus (req, res) {
  return Promise.try(function () {
    return getIndividualClaimDetails(req.params.claimId)
      .then(function (data) {
        var claim = data.claim

        var overpaymentAmount = req.body['overpayment-amount']
        var overpaymentRemaining = req.body['overpayment-remaining']
        var overpaymentReason = req.body['overpayment-reason']

        var overpaymentResponse = new OverpaymentResponse(overpaymentAmount, overpaymentRemaining, overpaymentReason, claim.IsOverpaid)

        return updateClaimOverpaymentStatus(claim, overpaymentResponse)
          .then(function () {
            return res.redirect(`/claim/${req.params.claimId}`)
          })
      })
  })
  .catch(function (error) {
    if (error instanceof ValidationError) {
      getIndividualClaimDetails(req.params.claimId)
        .then(function (data) {
          return renderErrors(data, req, res, error)
        })
    } else {
      throw error
    }
  })
}

function setAdvanceClaimStatusToClosed (req, res) {
  return Promise.try(function () {
    return closeAdvanceClaim(req.params.claimId, req.body['close-advance-claim-reason'])
    .then(function () {
      return res.redirect(`/`)
    })
  })
  .catch(function (error) {
    if (error instanceof ValidationError) {
      return getIndividualClaimDetails(req.params.claimId)
        .then(function (data) {
          return renderErrors(data, req, res, error)
        })
    } else {
      throw error
    }
  })
}

function requestNewPaymentDetails (req, res) {
  return Promise.try(function () {
    return getIndividualClaimDetails(req.params.claimId)
      .then(function (data) {
        requestNewPaymentDetails(data.claim.Reference, data.claim.EligibilityId, data.claim.ClaimId, req.body['payment-details-additional-information'], req.user.email)
          .then(function () {
            return res.redirect(`/`)
          })
      })
  })
  .catch(function (error) {
    if (error instanceof ValidationError) {
      getIndividualClaimDetails(req.params.claimId)
        .then(function (data) {
          return renderErrors(data, req, res, error)
        })
    } else {
      throw error
    }
  })
}

function renderViewClaimPage (claimId, res) {
  getIndividualClaimDetails(claimId)
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
        claimEvents: data.claimEvents,
        deductions: data.deductions,
        overpaidClaims: data.overpaidClaims
      })
    })
}

function renderErrors (data, req, res, error) {
  res.status(400).render('./claim/view-claim', {
    title: 'APVS Claim',
    Claim: data.claim,
    Expenses: data.claimExpenses,
    getDateFormatted: getDateFormatted,
    getClaimExpenseDetailFormatted: getClaimExpenseDetailFormatted,
    getDisplayFieldName: getDisplayFieldName,
    prisonerRelationshipsEnum: prisonerRelationshipsEnum,
    displayHelper: displayHelper,
    claimDecision: req.body,
    deductions: data.deductions,
    errors: error.validationErrors
  })
}
