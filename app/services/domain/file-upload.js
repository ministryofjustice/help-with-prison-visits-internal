const ValidationError = require('../errors/validation-error')
const FieldValidator = require('../validators/field-validator')
const ErrorHandler = require('../validators/error-handler')
const dateFormatter = require('../date-formatter')
const ERROR_MESSAGES = require('../validators/validation-error-messages')
const UploadError = require('../errors/upload-error')

class FileUpload {
  constructor (file, error, claimDocumentId, caseworker) {
    this.file = file
    this.error = error
    this.IsValid()
    this.path = file.path
    this.dateSubmitted = dateFormatter.now().toDate()
    this.claimDocumentId = claimDocumentId
    this.caseworker = caseworker

    if (file) {
      this.documentStatus = 'uploaded'
    }
  }

  IsValid () {
    const errors = ErrorHandler()

    if (this.error) {
      if (this.error instanceof UploadError) {
        throw new ValidationError({ upload: [ERROR_MESSAGES.getUploadIncorrectType] })
      } else {
        throw this.error
      }
    }

    FieldValidator(this.file, 'upload', errors)
      .isRequired()

    const validationErrors = errors.get()

    if (validationErrors) {
      throw new ValidationError(validationErrors)
    }
  }
}

module.exports = FileUpload
