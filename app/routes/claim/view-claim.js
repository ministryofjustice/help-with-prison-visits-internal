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
const insertDeduction = require('../../services/data/insert-deduction')
const disableDeduction = require('../../services/data/disable-deduction')
const ClaimDeduction = require('../../services/domain/claim-deduction')
const updateClaimOverpaymentStatus = require('../../services/data/update-claim-overpayment-status')
const OverpaymentResponse = require('../../services/domain/overpayment-response')

var claimExpenses

module.exports = function (router) {
  router.get('/claim/:claimId', function (req, res) {
    authorisation.isCaseworker(req)

    renderViewClaimPage(req.params.claimId, res)
  })

  router.post('/claim/:claimId', function (req, res) {
    authorisation.isCaseworker(req)

    getLastUpdated(req.params.claimId).then(function (lastUpdatedData) {
      try {
        var updateConflict = checkLastUpdated(lastUpdatedData.LastUpdated, req.body.lastUpdated)
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
              return renderErrors(data, req, res, error)
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

  router.post('/claim/:claimId/overpayment', function (req, res) {
    authorisation.isCaseworker(req)

    var isOverpaid = req.body['is-overpaid'] === 'on'
    var overpaymentAmount = req.body['overpayment-amount']

    try {
      var overpaymentResponse = new OverpaymentResponse(isOverpaid, overpaymentAmount)

      return getIndividualClaimDetails(req.params.claimId)
        .then(function (data) {
          var claim = data.claim

          return updateClaimOverpaymentStatus(claim, overpaymentResponse)
            .then(function () {
              return res.redirect(`/claim/${req.params.claimId}`)
            })
        })
    } catch (error) {
      getIndividualClaimDetails(req.params.claimId)
        .then(function (data) {
          return renderErrors(data, req, res, error)
        })
    }
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
