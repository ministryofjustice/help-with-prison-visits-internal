const ValidationError = require('../errors/validation-error')
const FieldValidator = require('../validators/field-validator')
const ErrorHandler = require('../validators/error-handler')
const ERROR_MESSAGES = require('../validators/validation-error-messages')
const claimDecisionEnum = require('../../constants/claim-decision-enum')

class ClaimDecision {
  constructor (caseworker,
               assistedDigitalCaseworker,
               decision,
               reasonRequest,
               reasonReject,
               additionalInfoApprove,
               additionalInfoRequest,
               additionalInfoReject,
               nomisCheck,
               dwpCheck,
               visitConfirmationCheck,
               claimExpenseResponses) {
    this.caseworker = caseworker
    this.assistedDigitalCaseworker = assistedDigitalCaseworker

    this.decision = decision
    if (this.decision === claimDecisionEnum.APPROVED) {
      this.reason = ''
      this.note = additionalInfoApprove
    } else if (decision === claimDecisionEnum.REJECTED) {
      this.reason = reasonReject
      this.note = additionalInfoReject
    } else {
      this.reason = reasonRequest
      this.note = additionalInfoRequest
    }
    this.nomisCheck = nomisCheck
    this.dwpCheck = dwpCheck
    this.visitConfirmationCheck = visitConfirmationCheck

    this.claimExpenseResponses = claimExpenseResponses
    claimExpenseResponses.forEach(function (expense) {
      if (expense.status === claimDecisionEnum.APPROVED) {
        expense.approvedCost = expense.cost
      } else if (expense.status !== claimDecisionEnum.APPROVED_DIFF_AMOUNT) {
        expense.approvedCost = null
      }
    })
    this.IsValid()
  }

  IsValid () {
    var errors = ErrorHandler()

    if (this.caseworker === this.assistedDigitalCaseworker) {
      throw new ValidationError({'assisted-digital-caseworker': [ERROR_MESSAGES.getAssistedDigitalCaseworkerSameClaim]})
    }

    FieldValidator(this.decision, 'decision', errors)
      .isRequired()

    if (this.decision !== claimDecisionEnum.APPROVED) {
      FieldValidator(this.reason, 'reason', errors)
        .isRequired()
    }

    this.claimExpenseResponses.forEach(function (expense) {
      FieldValidator(expense.status, 'claim-expense', errors)
        .isRequired()

      if (expense.approvedCost != null) {
        FieldValidator(expense.approvedCost, 'approve-cost', errors)
          .isRequired()
          .isCurrency()
          .isGreaterThanZero()
          .isLessThanMaximumDifferentApprovedAmount()
      }
    })

    FieldValidator(this.nomisCheck, 'nomis-check', errors)
      .isRequired()

    FieldValidator(this.dwpCheck, 'dwp-check', errors)
      .isRequired()

    FieldValidator(this.visitConfirmationCheck, 'visit-confirmation-check', errors)
      .isRequired()

    var validationErrors = errors.get()

    if (validationErrors) {
      throw new ValidationError(validationErrors)
    }
  }
}

module.exports = ClaimDecision
