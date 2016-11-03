const ValidationError = require('../errors/validation-error')
const FieldValidator = require('../validators/field-validator')
const ErrorHandler = require('../validators/error-handler')

class ClaimDecision {
  constructor (decision, reasonRequest, reasonReject, additionalInfoApprove, additionalInfoRequest, additionalInfoReject, nomisCheck, claimExpenseResponses) {
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
    this.nomisCheck = nomisCheck
    this.claimExpenseResponses = claimExpenseResponses
    claimExpenseResponses.forEach(function (expense) {
      if (expense.status === 'APPROVED') {
        expense.approvedCost = expense.cost
      } else {
        expense.approvedCost = null
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

      if (expense.approvedCost != null) {
        FieldValidator(expense.approvedCost, 'approve-cost', errors)
          .isRequired()
          .isCurrency()
          .isGreaterThanZero()
      }
    })

    FieldValidator(this.nomisCheck, 'nomis-check', errors)
      .isRequired()

    var validationErrors = errors.get()

    if (validationErrors) {
      throw new ValidationError(validationErrors)
    }
  }
}

module.exports = ClaimDecision
