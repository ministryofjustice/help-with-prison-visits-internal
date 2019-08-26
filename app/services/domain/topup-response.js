const ValidationError = require('../errors/validation-error')
const FieldValidator = require('../validators/field-validator')
const ErrorHandler = require('../validators/error-handler')

class TopupResponse {
  constructor (amount, reason) {
    this.amount = amount
    this.reason = reason

    this.IsValid()
  }

  IsValid () {
    var errors = ErrorHandler()

    FieldValidator(this.amount, 'top-up-amount', errors)
      .isRequired()
      .isGreaterThanZero()
      .isCurrency()
      .isMaxCostOrLess()

    FieldValidator(this.reason, 'reason', errors)
      .isLessThanLength(2000)

    var validationErrors = errors.get()

    if (validationErrors) {
      throw new ValidationError(validationErrors)
    }
  }
}

module.exports = TopupResponse
