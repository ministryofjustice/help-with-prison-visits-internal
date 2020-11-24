const validator = require('./common-validator')
const ERROR_MESSAGES = require('./validation-error-messages')

class FieldValidator {
  /**
   * Build a validator for validating fields.
   * @param data A single element to validate.
   * @param fieldName The name of of the HTML element to link the error message to.
   * @param errors An instance of the ErrorHandler class.
   */
  constructor (data, fieldName, errors) {
    this.data = data
    this.fieldName = fieldName
    this.errors = errors
  }

  isRequired (specificMessage) {
    const message = (!specificMessage) ? ERROR_MESSAGES.getIsRequired : specificMessage
    if (validator.isNullOrUndefined(this.data)) {
      this.errors.add(this.fieldName, message)
    } else if (this.data === 'Select') {
      this.errors.add(this.fieldName, message)
    }
    return this
  }

  isNumeric () {
    if (!validator.isNumeric(this.data)) {
      this.errors.add(this.fieldName, ERROR_MESSAGES.getIsNumeric)
    }
    return this
  }

  isCurrency () {
    if (!validator.isCurrency(this.data)) {
      this.errors.add(this.fieldName, ERROR_MESSAGES.getIsCurrency)
    }
    return this
  }

  isGreaterThanZero () {
    if (!validator.isGreaterThanZero(this.data)) {
      this.errors.add(this.fieldName, ERROR_MESSAGES.getIsGreaterThan)
    }
    return this
  }

  isGreaterThanOrEqualToZero () {
    if (!validator.isGreaterThanOrEqualToZero(this.data)) {
      this.errors.add(this.fieldName, ERROR_MESSAGES.getIsGreaterThanOrEqualTo)
    }
    return this
  }

  isGreaterThanMinimumClaim () {
    if (!validator.isGreaterThanMinimumClaim(this.data)) {
      this.errors.add(this.fieldName, ERROR_MESSAGES.isGreaterThanMinimumClaim)
    }
    return this
  }

  isLessThanMaximumDifferentApprovedAmount () {
    if (!validator.isLessThanMaximumDifferentApprovedAmount(this.data)) {
      this.errors.add(this.fieldName, ERROR_MESSAGES.getIsLessThanMaximumDifferentApprovedAmount)
    }
    return this
  }

  isEmail () {
    if (!validator.isEmail(this.data)) {
      this.errors.add(this.fieldName, ERROR_MESSAGES.getIsValidFormat)
    }
    return this
  }

  isLessThanLength (length, specificMessage) {
    const message = (!specificMessage) ? ERROR_MESSAGES.getIsLessThanLengthMessage : specificMessage
    if (!validator.isLessThanLength(this.data, length)) {
      this.errors.add(this.fieldName, message, { length: length })
    }
    return this
  }

  isInteger () {
    if (!validator.isInteger(this.data)) {
      this.errors.add(this.fieldName, ERROR_MESSAGES.getIsIntegerFormat)
    }
    return this
  }

  isMaxIntOrLess () {
    if (!validator.isMaxIntOrLess(this.data)) {
      this.errors.add(this.fieldName, ERROR_MESSAGES.getValueIsTooLarge)
    }
    return this
  }

  isMaxCostOrLess () {
    if (!validator.isMaxCostOrLess(this.data)) {
      this.errors.add(this.fieldName, ERROR_MESSAGES.getValueIsTooLarge)
    }
    return this
  }

  isValidDate (date) {
    if (!validator.isValidDate(date)) {
      this.errors.add(this.fieldName, ERROR_MESSAGES.getInvalidDateFormatMessage)
    }
    return this
  }

  isDateRequired (specificMessage) {
    const message = (!specificMessage) ? ERROR_MESSAGES.getIsRequired : specificMessage
    const self = this
    if (this.data instanceof Array) {
      this.data.forEach(function (data) {
        if (validator.isNullOrUndefined(data)) {
          self.errors.add(self.fieldName, message)
        }
      })
    }
    return this
  }

  isFutureDate (date) {
    if (!validator.isDateInTheFuture(date)) {
      this.errors.add(this.fieldName, ERROR_MESSAGES.getFutureDateMessage)
    }
    return this
  }
}

module.exports = function (data, fieldName, errors) {
  return new FieldValidator(data, fieldName, errors)
}
