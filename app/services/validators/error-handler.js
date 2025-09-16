const FIELD_NAMES = require('./validation-field-names')

class ErrorHandler {
  constructor() {
    this.errors = {}
  }

  add(fieldName, message, options) {
    if (!Object.prototype.hasOwnProperty.call(this.errors, fieldName)) {
      this.errors[fieldName] = []
    }
    this.errors[fieldName].push(message(FIELD_NAMES[fieldName], options))
  }

  get() {
    const { errors } = this

    const hasErrors = Object.keys(errors).some(field => errors[field].length > 0)

    return hasErrors ? errors : false
  }
}

module.exports = () => {
  return new ErrorHandler()
}
