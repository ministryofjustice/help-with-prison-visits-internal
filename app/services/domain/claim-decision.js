const ValidationError = require('../errors/validation-error')
const FieldValidator = require('../validators/field-validator')
const ErrorHandler = require('../validators/error-handler')

class ClaimDecision {
  constructor (decision, reasonRequest, reasonReject, additionalInfoApprove, additionalInfoRequest, additionalInfoReject, claimExpenseResponses) {
    this.decision = decision
    if (this.decision === 'APPROVED') {
      this.reason = ''
      this.note = additionalInfoApprove
    } else if (decision === 'REJECTED') {
      this.reason = reasonReject
      this.note = additionalInfoReject
    } else {
      this.reason = reasonRequest
      this.note = additionalInfoRequest
    }
    this.claimExpenseResponses = claimExpenseResponses
    claimExpenseResponses.forEach(function (expense) {
      if (expense.status === 'REQUEST-INFORMATION') {
        expense.approvedCost = null
      } else if (expense.status !== 'APPROVED-DIFF-AMOUNT') {
        expense.approvedCost = expense.cost
      }
    })
    this.IsValid()
  }

  IsValid () {
    var errors = ErrorHandler()

    FieldValidator(this.decision, 'decision', errors)
      .isRequired()

    if (this.decision !== 'APPROVED') {
      FieldValidator(this.reason, 'reason', errors)
        .isRequired()
    }

    this.claimExpenseResponses.forEach(function (expense) {
      FieldValidator(expense.status, 'claim-expense', errors)
        .isRequired()

      FieldValidator(expense.approvedCost, 'approve-cost', errors)
        .isRequired()
        .isCurrency()
        .isGreaterThanZero()
    })

    var validationErrors = errors.get()

    if (validationErrors) {
      throw new ValidationError(validationErrors)
    }
  }
}

module.exports = ClaimDecision
