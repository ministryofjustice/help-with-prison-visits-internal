const ValidationError = require('../errors/validation-error')
const FieldValidator = require('../validators/field-validator')
const ErrorHandler = require('../validators/error-handler')

class AuditConfig {
  constructor(thresholdAmount, verificationPercent) {
    this.thresholdAmount = thresholdAmount || ''
    this.verificationPercent = verificationPercent || ''

    this.IsValid()
  }

  IsValid() {
    const errors = ErrorHandler()

    FieldValidator(this.thresholdAmount, 'audit-threshold', errors)
      .isRequired()
      .isNumeric()
      .isGreaterThanZero()
      .isMaxCostOrLess()
      .isInteger()

    FieldValidator(this.verificationPercent, 'audit-verification-percentage', errors)
      .isRequired()
      .isNumeric()
      .isGreaterThanZero()
      .isLessOrEqualToHundred()

    const validationErrors = errors.get()

    if (validationErrors) {
      throw new ValidationError(validationErrors)
    }
  }
}

module.exports = AuditConfig
