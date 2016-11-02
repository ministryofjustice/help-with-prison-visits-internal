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
