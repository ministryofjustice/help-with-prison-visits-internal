const ValidationError = require('../errors/validation-error')
const FieldValidator = require('../validators/field-validator')
const ErrorHandler = require('../validators/error-handler')

class ClaimDeduction {
  constructor (deductionType, amount) {
    this.deductionType = deductionType
    this.amount = amount
    this.IsValid()
  }

  IsValid () {
    const errors = ErrorHandler()

    FieldValidator(this.deductionType, 'deductionType', errors)
      .isRequired()

    FieldValidator(this.amount, 'deductionAmount', errors)
      .isRequired()
      .isCurrency()
      .isGreaterThanZero()
      .isMaxCostOrLess()

    const validationErrors = errors.get()

    if (validationErrors) {
      throw new ValidationError(validationErrors)
    }
  }
}

module.exports = ClaimDeduction
