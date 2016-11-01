const ValidationError = require('../errors/validation-error')
const FieldValidator = require('../validators/field-validator')
const ErrorHandler = require('../validators/error-handler')

class ClaimDecision {
  constructor (decision, reason, note, claimExpenseResponses) {
    if (decision) {
      if (decision === 'approve') {
        this.decision = 'APPROVED'
      } else if (decision === 'reject') {
        this.decision = 'REJECTED'
      } else {
        this.decision = 'REQUEST_INFORMATION'
      }
    } else {
      this.decision = ''
    }
    this.reason = reason
    this.note = note
    this.claimExpenseResponses = claimExpenseResponses

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

    // TODO validate claimExpenseResponses

    var validationErrors = errors.get()

    if (validationErrors) {
      throw new ValidationError(validationErrors)
    }
  }
}

module.exports = ClaimDecision
