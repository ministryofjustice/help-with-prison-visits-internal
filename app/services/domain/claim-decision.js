const ValidationError = require('../errors/validation-error')
const FieldValidator = require('../validators/field-validator')
const ErrorHandler = require('../validators/error-handler')

class ClaimDecision {
  constructor (claimStatus) {
    if (claimStatus.decision) {
      if (claimStatus.decision === 'approve') {
        this.decision = 'APPROVED'
        this.reason = claimStatus.reason
        this.note = claimStatus.additionalInfoApprove
      } else if (claimStatus.decision === 'reject') {
        this.decision = 'REJECTED'
        this.reason = claimStatus.reasonReject
        this.note = claimStatus.additionalInfoReject
      } else {
        this.decision = 'REQUEST-INFORMATION'
        this.reason = claimStatus.reasonRequest
        this.note = claimStatus.additionalInfoRequest
      }
    } else {
      this.decision = ''
    }
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

    var validationErrors = errors.get()

    if (validationErrors) {
      throw new ValidationError(validationErrors)
    }
  }
}

module.exports = ClaimDecision
