const ValidationError = require('../errors/validation-error')
const FieldValidator = require('../validators/field-validator')
const ErrorHandler = require('../validators/error-handler')

class OverpaymentResponse {
  constructor (isOverpaid, amount) {
    this.isOverpaid = isOverpaid
    this.amount = amount
    this.IsValid()
  }

  IsValid () {
    var errors = ErrorHandler()

    if (this.isOverpaid) {
      FieldValidator(this.amount, 'overpayment-amount', errors)
      .isRequired()
      .isCurrency()
      .isGreaterThanZero()
    }

    var validationErrors = errors.get()

    if (validationErrors) {
      throw new ValidationError(validationErrors)
    }
  }
}

module.exports = OverpaymentResponse
