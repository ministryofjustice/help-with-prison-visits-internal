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

  isRequired (questionType) {
    if (validator.isNullOrUndefined(this.data)) {
      if (questionType === 'radio') {
        this.errors.add(this.fieldName, ERROR_MESSAGES.getRadioQuestionIsRequired)
      } else {
        this.errors.add(this.fieldName, ERROR_MESSAGES.getIsRequired)
      }
    } else if (this.data === 'Select') {
      this.errors.add(this.fieldName, ERROR_MESSAGES.getDropboxIsRequired)
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

  isLessThanMaximumDifferentApprovedAmount () {
    if (!validator.isLessThanMaximumDifferentApprovedAmount(this.data)) {
      this.errors.add(this.fieldName, ERROR_MESSAGES.getIsLessThanMaximumDifferentApprovedAmount)
    }
    return this
  }
}

module.exports = function (data, fieldName, errors) {
  return new FieldValidator(data, fieldName, errors)
}
