const authorisation = require('../../services/authorisation')
const getIndividualClaimDetails = require('../../services/data/get-individual-claim-details')
const getClaimDocumentFilePath = require('../../services/data/get-claim-document-file-path')
const getDateFormatted = require('../../views/helpers/date-helper')
const getClaimExpenseDetailFormatted = require('../../views/helpers/claim-expense-helper')
const getChildFormatted = require('../../views/helpers/child-helper')
const getDisplayFieldName = require('../../views/helpers/display-field-names')
const ValidationError = require('../../services/errors/validation-error')
const ClaimDecision = require('../../services/domain/claim-decision')
const SubmitClaimResponse = require('../../services/data/submit-claim-response')
const getClaimExpenseResponses = require('../helpers/get-claim-expense-responses')
const prisonerRelationshipsEnum = require('../../constants/prisoner-relationships-enum')
const receiptAndProcessedManuallyEnum = require('../../constants/receipt-and-processed-manually-enum')
const displayHelper = require('../../views/helpers/display-helper')
const mergeClaimExpensesWithSubmittedResponses = require('../helpers/merge-claim-expenses-with-submitted-responses')
const getLastUpdated = require('../../services/data/get-claim-last-updated')
const checkUserAndLastUpdated = require('../../services/check-user-and-last-updated')
const insertDeduction = require('../../services/data/insert-deduction')
const disableDeduction = require('../../services/data/disable-deduction')
const ClaimDeduction = require('../../services/domain/claim-deduction')
const BenefitExpiryDate = require('../../services/domain/benefit-expiry-date')
const updateClaimOverpaymentStatus = require('../../services/data/update-claim-overpayment-status')
const insertTopUp = require('../../services/data/insert-top-up')
const cancelTopUp = require('../../services/data/cancel-top-up')
const OverpaymentResponse = require('../../services/domain/overpayment-response')
const TopupResponse = require('../../services/domain/topup-response')
const closeAdvanceClaim = require('../../services/data/close-advance-claim')
const payoutBarcodeExpiredClaim = require('../../services/data/payout-barcode-expired-claim')
const disableReferenceNumber = require('../../services/data/disable-reference-number')
const reEnableReferenceNumber = require('../../services/data/re-enable-reference-number')
const insertNote = require('../../services/data/insert-note')
const updateEligibilityTrustedStatus = require('../../services/data/update-eligibility-trusted-status')
const requestNewBankDetails = require('../../services/data/request-new-bank-details')
const claimDecisionEnum = require('../../../app/constants/claim-decision-enum')
const updateAssignmentOfClaims = require('../../services/data/update-assignment-of-claims')
const checkUserAssignment = require('../../services/check-user-assignment')
const Promise = require('bluebird')
const getRejectionReasons = require('../../services/data/get-rejection-reasons')
const getRejectionReasonId = require('../../services/data/get-rejection-reason-id')
const updateVisitorBenefitExpiryDate = require('../../services/data/update-visitor-benefit-expiry-date')
const applicationRoles = require('../../constants/application-roles-enum')

let claimExpenses
let claimDeductions

module.exports = function (router) {
  // GET
  router.get('/claim/:claimId', function (req, res) {
    const allowedRoles = [
      applicationRoles.CLAIM_ENTRY_BAND_2,
      applicationRoles.CLAIM_PAYMENT_BAND_3,
      applicationRoles.CASEWORK_MANAGER_BAND_5,
      applicationRoles.BAND_9,
      applicationRoles.APPLICATION_DEVELOPER
    ]
    authorisation.hasRoles(req, allowedRoles)
    return renderViewClaimPage(req.params.claimId, req, res)
  })

  // APVS0246 Need Clarification on who can do this
  router.get('/claim/:claimId/download', function (req, res, next) {
    const allowedRoles = [
      applicationRoles.CLAIM_ENTRY_BAND_2,
      applicationRoles.CLAIM_PAYMENT_BAND_3,
      applicationRoles.CASEWORK_MANAGER_BAND_5
    ]
    authorisation.hasRoles(req, allowedRoles)

    return Promise.try(function () {
      const claimDocumentId = req.query['claim-document-id']
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
    const needAssignmentCheck = true
    let allowedRoles = []

    if (req.body.decision === claimDecisionEnum.APPROVED || req.body.decision === claimDecisionEnum.REJECTED) {
      allowedRoles.push(applicationRoles.CLAIM_PAYMENT_BAND_3)
    } else if (req.body.decision === claimDecisionEnum.REQUEST_INFORMATION) {
      allowedRoles = [
        applicationRoles.CLAIM_PAYMENT_BAND_3,
        applicationRoles.CASEWORK_MANAGER_BAND_5,
        applicationRoles.BAND_9
      ]
    }
    return validatePostRequest(req, res, next, allowedRoles, needAssignmentCheck, '/', function () {
      claimExpenses = getClaimExpenseResponses(req.body)
      return submitClaimDecision(req, res, claimExpenses)
    })
  })

  router.post('/claim/:claimId/add-deduction', function (req, res, next) {
    const needAssignmentCheck = true
    const allowedRoles = [applicationRoles.CLAIM_PAYMENT_BAND_3]
    return validatePostRequest(req, res, next, allowedRoles, needAssignmentCheck, `/claim/${req.params.claimId}`, function () {
      const deductionType = req.body.deductionType
      // var amount = Number(req.body.deductionAmount).toFixed(2)
      const amount = req.body.deductionAmount
      const claimDeduction = new ClaimDeduction(deductionType, amount)
      claimExpenses = getClaimExpenseResponses(req.body)

      return insertDeduction(req.params.claimId, claimDeduction)
        .then(function () {
          return false
        })
    })
  })

  router.post('/claim/:claimId/remove-deduction', function (req, res, next) {
    const needAssignmentCheck = true
    const allowedRoles = [applicationRoles.CLAIM_PAYMENT_BAND_3]
    return validatePostRequest(req, res, next, allowedRoles, needAssignmentCheck, `/claim/${req.params.claimId}`, function () {
      const removeDeductionId = getClaimDeductionId(req.body)

      return disableDeduction(removeDeductionId)
        .then(function () {
          return false
        })
    })
  })

  // APVS0246 Need Clarification on who can do this
  router.post('/claim/:claimId/update-benefit-expiry-date', function (req, res, next) {
    const needAssignmentCheck = true
    const allowedRoles = [
      applicationRoles.CLAIM_ENTRY_BAND_2,
      applicationRoles.CLAIM_PAYMENT_BAND_3,
      applicationRoles.CASEWORK_MANAGER_BAND_5
    ]
    return validatePostRequest(req, res, next, allowedRoles, needAssignmentCheck, `/claim/${req.params.claimId}`, function () {
      const benefitExpiryDate = new BenefitExpiryDate(req.body['expiry-day'], req.body['expiry-month'], req.body['expiry-year'])
      return updateVisitorBenefitExpiryDate(req.params.claimId, benefitExpiryDate)
        .then(function () {
          return false
        })
    })
  })

  router.post('/claim/:claimId/update-overpayment-status', function (req, res, next) {
    const needAssignmentCheck = true
    const allowedRoles = [applicationRoles.CLAIM_PAYMENT_BAND_3]
    return validatePostRequest(req, res, next, allowedRoles, needAssignmentCheck, `/claim/${req.params.claimId}`, function () {
      return getIndividualClaimDetails(req.params.claimId)
        .then(function (data) {
          const claim = data.claim

          const overpaymentAmount = req.body['overpayment-amount']
          const overpaymentRemaining = req.body['overpayment-remaining']
          const overpaymentReason = req.body['overpayment-reason']

          const overpaymentResponse = new OverpaymentResponse(overpaymentAmount, overpaymentRemaining, overpaymentReason, claim.IsOverpaid)

          return updateClaimOverpaymentStatus(claim, overpaymentResponse)
        })
    })
  })

  router.post('/claim/:claimId/close-advance-claim', function (req, res, next) {
    const needAssignmentCheck = true
    const allowedRoles = [
      applicationRoles.CLAIM_PAYMENT_BAND_3,
      applicationRoles.CASEWORK_MANAGER_BAND_5,
      applicationRoles.BAND_9
    ]
    return validatePostRequest(req, res, next, allowedRoles, needAssignmentCheck, `/claim/${req.params.claimId}`, function () {
      return closeAdvanceClaim(req.params.claimId, req.body['close-advance-claim-reason'], req.user.email)
    })
  })

  router.post('/claim/:claimId/request-new-payment-details', function (req, res, next) {
    const needAssignmentCheck = true
    const allowedRoles = [
      applicationRoles.CLAIM_PAYMENT_BAND_3,
      applicationRoles.CASEWORK_MANAGER_BAND_5,
      applicationRoles.BAND_9
    ]
    return validatePostRequest(req, res, next, allowedRoles, needAssignmentCheck, `/claim/${req.params.claimId}`, function () {
      return getIndividualClaimDetails(req.params.claimId)
        .then(function (data) {
          if (data.TopUps.allTopUpsPaid) {
            return requestNewBankDetails(data.claim.Reference, data.claim.EligibilityId, req.params.claimId, req.body['payment-details-additional-information'], req.user.email)
          } else {
            throw new Error('Bank payment details cannot be requested for a claim with an outstanding Top Up')
          }
        })
    })
  })

  router.post('/claim/:claimId/add-top-up', function (req, res, next) {
    const needAssignmentCheck = true
    const allowedRoles = [applicationRoles.CLAIM_PAYMENT_BAND_3]
    return validatePostRequest(req, res, next, allowedRoles, needAssignmentCheck, `/claim/${req.params.claimId}`, function () {
      return getIndividualClaimDetails(req.params.claimId)
        .then(function (data) {
          if (data.claim.PaymentStatus === 'PROCESSED' && data.TopUps.allTopUpsPaid) {
            const claim = data.claim
            const topupAmount = req.body['top-up-amount']
            const topupReason = req.body['top-up-reason']
            const topupResponse = new TopupResponse(topupAmount, topupReason)
            return insertTopUp(claim, topupResponse, req.user.email)
              .then(function () {
                return false
              })
          } else {
            throw new Error('A Top Up Cannot be added to Claim with a Pending Payment')
          }
        })
    })
  })

  router.post('/claim/:claimId/cancel-top-up', function (req, res, next) {
    const needAssignmentCheck = true
    const allowedRoles = [applicationRoles.CLAIM_PAYMENT_BAND_3]
    return validatePostRequest(req, res, next, allowedRoles, needAssignmentCheck, `/claim/${req.params.claimId}`, function () {
      return getIndividualClaimDetails(req.params.claimId)
        .then(function (data) {
          const claim = data.claim
          return cancelTopUp(claim, req.user.email)
            .then(function () {
              return false
            })
        })
    })
  })

  router.post('/claim/:claimId/payout-barcode-expired', function (req, res, next) {
    const needAssignmentCheck = true
    const allowedRoles = [
      applicationRoles.CLAIM_PAYMENT_BAND_3,
      applicationRoles.CASEWORK_MANAGER_BAND_5,
      applicationRoles.BAND_9
    ]
    return validatePostRequest(req, res, next, allowedRoles, needAssignmentCheck, `/claim/${req.params.claimId}`, function () {
      return payoutBarcodeExpiredClaim(req.params.claimId, req.body['payout-barcode-expired-additional-information'])
    })
  })

  router.post('/claim/:claimId/disable-reference-number', function (req, res, next) {
    const needAssignmentCheck = true
    const allowedRoles = [
      applicationRoles.CLAIM_PAYMENT_BAND_3,
      applicationRoles.CASEWORK_MANAGER_BAND_5,
      applicationRoles.BAND_9
    ]
    return validatePostRequest(req, res, next, allowedRoles, needAssignmentCheck, `/claim/${req.params.claimId}`, function () {
      return disableReferenceNumber(req.params.claimId, req.body.referenceToBeDisabled, req.body['disable-reference-number-additional-information'], req.user.email)
    })
  })

  router.post('/claim/:claimId/re-enable-reference-number', function (req, res, next) {
    const needAssignmentCheck = true
    const allowedRoles = [
      applicationRoles.CLAIM_PAYMENT_BAND_3,
      applicationRoles.CASEWORK_MANAGER_BAND_5,
      applicationRoles.BAND_9
    ]
    return validatePostRequest(req, res, next, allowedRoles, needAssignmentCheck, `/claim/${req.params.claimId}`, function () {
      return reEnableReferenceNumber(req.params.claimId, req.body.referenceToBeReEnabled, req.body['re-enable-reference-number-additional-information'], req.user.email)
    })
  })

  // APVS0246 Need Clarification on who can do this
  router.post('/claim/:claimId/insert-note', function (req, res, next) {
    const needAssignmentCheck = false
    const allowedRoles = [
      applicationRoles.CLAIM_ENTRY_BAND_2,
      applicationRoles.CLAIM_PAYMENT_BAND_3,
      applicationRoles.CASEWORK_MANAGER_BAND_5
    ]
    if (!req.body['note-information']) {
      return handleError('Note must not be blank.', req, res, false, next)
    } else {
      return validatePostRequest(req, res, next, allowedRoles, needAssignmentCheck, `/claim/${req.params.claimId}`, function () {
        return insertNote(req.params.claimId, req.body['note-information'], req.user.email)
      })
    }
  })

  router.post('/claim/:claimId/assign-self', function (req, res, next) {
    const needAssignmentCheck = false
    const allowedRoles = [
      applicationRoles.CLAIM_PAYMENT_BAND_3,
      applicationRoles.CASEWORK_MANAGER_BAND_5,
      applicationRoles.BAND_9
    ]
    return validatePostRequest(req, res, next, allowedRoles, needAssignmentCheck, `/claim/${req.params.claimId}`, function () {
      return updateAssignmentOfClaims(req.params.claimId, req.user.email)
        .then(function () {
          return false
        })
    })
  })

  router.post('/claim/:claimId/unassign', function (req, res, next) {
    const needAssignmentCheck = false
    const allowedRoles = [
      applicationRoles.CLAIM_PAYMENT_BAND_3,
      applicationRoles.CASEWORK_MANAGER_BAND_5,
      applicationRoles.BAND_9
    ]
    return validatePostRequest(req, res, next, allowedRoles, needAssignmentCheck, `/claim/${req.params.claimId}`, function () {
      return updateAssignmentOfClaims(req.params.claimId, null)
    })
  })
}

// Functions
function getClaimDeductionId (requestBody) {
  let deductionId = null
  Object.keys(requestBody).forEach(function (key) {
    if (key.indexOf('remove-deduction') > -1) {
      deductionId = key.substring(key.lastIndexOf('-') + 1)
    }
  })

  return deductionId
}
// APVS0246 Going to need to pass in the required roles
function validatePostRequest (req, res, next, allowedRoles, needAssignmentCheck, redirectUrl, postFunction) {
  authorisation.hasRoles(req, allowedRoles)
  let updateConflict = true

  return Promise.try(function () {
    return checkForUpdateConflict(req.params.claimId, req.body.lastUpdated, needAssignmentCheck, req.user.email).then(function (hasConflict) {
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
  return getIndividualClaimDetails(req.params.claimId)
    .then(function (data) {
      claimDeductions = data.deductions
      return getRejectionReasonId(req.body.additionalInfoReject)
        .then(function (rejectionReasonId) {
          const claimDecision = new ClaimDecision(
            req.user.email,
            req.body.assistedDigitalCaseworker,
            req.body.decision,
            req.body.additionalInfoApprove,
            req.body.additionalInfoRequest,
            req.body.additionalInfoReject,
            req.body.nomisCheck,
            req.body.dwpCheck,
            req.body.visitConfirmationCheck,
            claimExpenses,
            claimDeductions,
            req.body.isAdvanceClaim,
            rejectionReasonId,
            req.body.additionalInfoRejectManual,
            req.body['expiry-day'],
            req.body['expiry-month'],
            req.body['expiry-year'],
            req.body['release-date-is-set'],
            req.body['release-day'],
            req.body['release-month'],
            req.body['release-year']
          )
          return SubmitClaimResponse(req.params.claimId, claimDecision)
            .then(function () {
              if (claimDecision.decision === claimDecisionEnum.APPROVED) {
                const isTrusted = req.body['is-trusted'] === 'on'
                const untrustedReason = req.body['untrusted-reason']

                return updateEligibilityTrustedStatus(req.params.claimId, isTrusted, untrustedReason)
              }
            })
        })
    })
}

function checkForUpdateConflict (claimId, currentLastUpdated, needAssignmentCheck, user) {
  return getLastUpdated(claimId).then(function (lastUpdatedData) {
    return checkUserAndLastUpdated(lastUpdatedData, currentLastUpdated, needAssignmentCheck, user)
      .then(function () {
        return false
      })
  })
}

function renderViewClaimPage (claimId, req, res, keepUnsubmittedChanges) {
  return getIndividualClaimDetails(claimId)
    .then(function (data) {
      if (keepUnsubmittedChanges) {
        populateNewData(data, req)
      }
      if (data.claim.BenefitExpiryDate) {
        data.claim.expiryDay = getDateFormatted.getDay(data.claim.BenefitExpiryDate)
        data.claim.expiryMonth = getDateFormatted.getMonth(data.claim.BenefitExpiryDate)
        data.claim.expiryYear = getDateFormatted.getYear(data.claim.BenefitExpiryDate)
      }
      if (data.claim.ReleaseDate) {
        data.claim.releaseDay = getDateFormatted.getDay(data.claim.ReleaseDate)
        data.claim.releaseMonth = getDateFormatted.getMonth(data.claim.ReleaseDate)
        data.claim.releaseYear = getDateFormatted.getYear(data.claim.ReleaseDate)
      }
      return getRejectionReasons()
        .then(function (rejectionReasons) {
          data.rejectionReasons = rejectionReasons
          const error = { ValidationError: null }
          return res.render('./claim/view-claim', renderValues(data, req, error))
        })
    })
}

function handleError (error, req, res, updateConflict, next) {
  if (error instanceof ValidationError) {
    return getIndividualClaimDetails(req.params.claimId)
      .then(function (data) {
        if (data.claim && data.claimExpenses && !updateConflict && claimExpenses) {
          populateNewData(data, req)
        }
        if (req.route.path.includes('/update-benefit-expiry-date')) {
          data.claim.expiryDay = req.body['expiry-day']
          data.claim.expiryMonth = req.body['expiry-month']
          data.claim.expiryYear = req.body['expiry-year']
        }
        return getRejectionReasons()
          .then(function (rejectionReasons) {
            data.rejectionReasons = rejectionReasons
            return res.status(400).render('./claim/view-claim', renderValues(data, req, error))
          })
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
  data.claim.expiryDay = req.body['expiry-day']
  data.claim.expiryMonth = req.body['expiry-month']
  data.claim.expiryYear = req.body['expiry-year']
  if (req.body['release-date-is-set']) {
    data.claim.ReleaseDateIsSet = true
  } else {
    data.claim.ReleaseDateIsSet = false
  }
  if (data.latestUnpaidTopUp) {
    data.latestUnpaidTopUp.TopUpAmount = req.body['top-up-amount']
    data.latestUnpaidTopUp.Reason = req.body['top-up-reason']
  } else {
    data.latestUnpaidTopUp = {
      TopUpAmount: req.body['top-up-amount'],
      Reason: req.body['top-up-reason']
    }
  }
  data.claim.releaseDay = req.body['release-day']
  data.claim.releaseMonth = req.body['release-month']
  data.claim.releaseYear = req.body['release-year']
}

function renderValues (data, req, error) {
  const displayJson = {
    title: 'APVS Claim',
    Claim: data.claim,
    ClaimEligibleChild: data.claimEligibleChild,
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
    receiptAndProcessedManuallyEnum: receiptAndProcessedManuallyEnum,
    deductions: data.deductions,
    duplicates: data.duplicates,
    claimEvents: data.claimEvents,
    TopUps: data.TopUps,
    overpaidClaims: data.overpaidClaims,
    claimantDuplicates: data.claimantDuplicates,
    bankDuplicates: data.bankDuplicates,
    claimDecisionEnum: claimDecisionEnum,
    errors: error.validationErrors,
    unlock: checkUserAssignment(req.user.email, data.claim.AssignedTo, data.claim.AssignmentExpiry),
    latestUnpaidTopUp: data.latestUnpaidTopUp,
    topUpAmount: req.body['top-up-amount'],
    topUpReason: req.body['top-up-reason'],
    errorWasThrown: true
  }
  if (data.rejectionReasons) {
    displayJson.rejectionReasons = data.rejectionReasons
  }
  if (req.body.additionalInfoReject) {
    displayJson.selectedRejectReason = req.body.additionalInfoReject
  }
  return displayJson
}
