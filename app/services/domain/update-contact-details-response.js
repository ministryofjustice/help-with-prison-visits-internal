const ValidationError = require('../errors/validation-error')
const FieldValidator = require('../validators/field-validator')
const ErrorHandler = require('../validators/error-handler')

class UpdateContactDetailsResponse {
  constructor (emailAddress, phoneNumber) {
    this.emailAddress = emailAddress
    this.phoneNumber = phoneNumber

    this.IsValid()
  }

  IsValid () {
    const errors = ErrorHandler()

    FieldValidator(this.emailAddress, 'EmailAddress', errors)
      .isRequired()
      .isLessThanLength(100)
      .isEmail()

    FieldValidator(this.phoneNumber, 'PhoneNumber', errors)
      .isLessThanLength(20)

    const validationErrors = errors.get()

    if (validationErrors) {
      throw new ValidationError(validationErrors)
    }
  }
}

module.exports = UpdateContactDetailsResponse
