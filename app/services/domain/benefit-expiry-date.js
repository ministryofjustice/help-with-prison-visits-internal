const ValidationError = require('../errors/validation-error')
const FieldValidator = require('../validators/field-validator')
const ErrorHandler = require('../validators/error-handler')
const dateFormatter = require('../date-formatter')
const ERROR_MESSAGES = require('../validators/validation-error-messages')

class BenefitExpiryDate {
  constructor (day, month, year) {
    this.expiryDateFields = [
      day,
      month,
      year
    ]
    this.expiryDate = dateFormatter.build(day, month, year)
    this.IsValid()
  }

  IsValid () {
    const errors = ErrorHandler()

    FieldValidator(this.expiryDateFields, 'benefit-expiry', errors)
      .isDateRequired(ERROR_MESSAGES.getExpiryDateIsRequired)
      .isValidDate(this.expiryDate)

    const validationErrors = errors.get()

    if (validationErrors) {
      throw new ValidationError(validationErrors)
    }
  }
}

module.exports = BenefitExpiryDate
