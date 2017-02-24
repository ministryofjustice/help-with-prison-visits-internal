const expect = require('chai').expect
const FieldValidator = require('../../../../app/services/validators/field-validator')
const ErrorHandler = require('../../../../app/services/validators/error-handler')
const ERROR_MESSAGES = require('../../../../app/services/validators/validation-error-messages')

describe('services/validators/field-validator', function () {
  const VALID_ALPHA = 'data'
  const VALID_NUMERIC = '1'
  const INVALID_DATA = ''
  const FIELD_NAME = 'field name'
  const ERROR_HANDLER = ErrorHandler()

  describe('isRequired', function () {
    it('should return an error object if passed null', function (done) {
      var errorHandler = ErrorHandler()
      FieldValidator(null, FIELD_NAME, errorHandler)
        .isRequired()
      var errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })

    it('should return an error object if passed undefined', function (done) {
      var errorHandler = ErrorHandler()
      FieldValidator(undefined, FIELD_NAME, errorHandler)
        .isRequired()
      var errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })

    it('should throw error if data is an object', function (done) {
      var errorHandler = ErrorHandler()
      FieldValidator({}, FIELD_NAME, errorHandler)
        .isRequired()
      var errors = errorHandler.get()
      expect(errors).to.equal(false)
      done()
    })

    it('should return an error if passed invalid data with a specific message', function () {
      var errorHandler = ErrorHandler()
      FieldValidator(null, FIELD_NAME, errorHandler)
        .isRequired(ERROR_MESSAGES.getRadioQuestionIsRequired)
      var errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      expect(errors[FIELD_NAME]).to.include(ERROR_MESSAGES.getRadioQuestionIsRequired())
    })

    it('should return false if passed valid data', function (done) {
      var errorHandler = ErrorHandler()
      FieldValidator(VALID_ALPHA, FIELD_NAME, errorHandler)
        .isRequired()
      var errors = errorHandler.get()
      expect(errors).to.equal(false)
      done()
    })

    it('should return an error object if passed invalid data', function (done) {
      var errorHandler = ErrorHandler()
      FieldValidator(INVALID_DATA, FIELD_NAME, errorHandler)
        .isRequired()
      var errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })
  })

  describe('isNumeric', function () {
    it('should throw error if data is null', function (done) {
      expect(function () {
        FieldValidator(null, FIELD_NAME, ERROR_HANDLER)
          .isNumeric()
      }).to.throw(TypeError)
      done()
    })

    it('should throw error if data is undefined', function (done) {
      expect(function () {
        FieldValidator(undefined, FIELD_NAME, ERROR_HANDLER)
          .isNumeric()
      }).to.throw(TypeError)
      done()
    })

    it('should throw error if data is an object', function (done) {
      expect(function () {
        FieldValidator({}, FIELD_NAME, ERROR_HANDLER)
          .isNumeric()
      }).to.throw(TypeError)
      done()
    })

    it('should return false if passed valid data', function (done) {
      var errorHandler = ErrorHandler()
      FieldValidator(VALID_NUMERIC, FIELD_NAME, errorHandler)
        .isNumeric()
      var errors = errorHandler.get()
      expect(errors).to.equal(false)
      done()
    })

    it('should return an error object if passed invalid data', function (done) {
      var errorHandler = ErrorHandler()
      FieldValidator(INVALID_DATA, FIELD_NAME, errorHandler)
        .isNumeric()
      var errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })
  })

  describe('isCurrency', function () {
    const VALID_INPUT = '20'
    const INVALID_INPUT = 'invalid'

    it('should throw error if data is null', function (done) {
      expect(function () {
        FieldValidator(null, FIELD_NAME, ERROR_HANDLER)
          .isCurrency()
      }).to.throw(TypeError)
      done()
    })

    it('should throw error if data is undefined', function (done) {
      expect(function () {
        FieldValidator(undefined, FIELD_NAME, ERROR_HANDLER)
          .isCurrency()
      }).to.throw(TypeError)
      done()
    })

    it('should throw error if data is an object', function (done) {
      expect(function () {
        FieldValidator({}, FIELD_NAME, ERROR_HANDLER)
          .isCurrency()
      }).to.throw(TypeError)
      done()
    })

    it('should return false if passed valid data', function (done) {
      var errorHandler = ErrorHandler()
      FieldValidator(VALID_INPUT, FIELD_NAME, errorHandler)
        .isCurrency()
      var errors = errorHandler.get()
      expect(errors).to.equal(false)
      done()
    })

    it('should return an error object if passed invalid data', function (done) {
      var errorHandler = ErrorHandler()
      FieldValidator(INVALID_INPUT, FIELD_NAME, errorHandler)
        .isCurrency()
      var errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })
  })

  describe('isGreaterThanZero', function () {
    const VALID_INPUT = '20'
    const INVALID_INPUT = '0'

    it('should return an error object if passed null', function (done) {
      var errorHandler = ErrorHandler()
      FieldValidator(null, FIELD_NAME, errorHandler)
        .isGreaterThanZero()
      var errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })

    it('should return an error object if passed undefined', function (done) {
      var errorHandler = ErrorHandler()
      FieldValidator(undefined, FIELD_NAME, errorHandler)
        .isGreaterThanZero()
      var errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })

    it('should return an error object if passed an object', function (done) {
      var errorHandler = ErrorHandler()
      FieldValidator({}, FIELD_NAME, errorHandler)
        .isGreaterThanZero()
      var errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })

    it('should return false if passed a numeric value greater than zero', function (done) {
      var errorHandler = ErrorHandler()
      FieldValidator(VALID_INPUT, FIELD_NAME, errorHandler)
        .isGreaterThanZero()
      var errors = errorHandler.get()
      expect(errors).to.equal(false)
      done()
    })

    it('should return an error object if passed a value less than or equal to zero', function (done) {
      var errorHandler = ErrorHandler()
      FieldValidator(INVALID_INPUT, FIELD_NAME, errorHandler)
        .isGreaterThanZero()
      var errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })
  })

  describe('isLessThanMaximumDifferentApprovedAmount', function () {
    const VALID_INPUT = '20'
    const INVALID_INPUT = '300'

    it('should return an error object if passed null', function (done) {
      var errorHandler = ErrorHandler()
      FieldValidator(null, FIELD_NAME, errorHandler)
        .isLessThanMaximumDifferentApprovedAmount()
      var errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })

    it('should return an error object if passed undefined', function (done) {
      var errorHandler = ErrorHandler()
      FieldValidator(undefined, FIELD_NAME, errorHandler)
        .isLessThanMaximumDifferentApprovedAmount()
      var errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })

    it('should return an error object if passed an object', function (done) {
      var errorHandler = ErrorHandler()
      FieldValidator({}, FIELD_NAME, errorHandler)
        .isLessThanMaximumDifferentApprovedAmount()
      var errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })

    it('should return false if passed a numeric value greater than zero', function (done) {
      var errorHandler = ErrorHandler()
      FieldValidator(VALID_INPUT, FIELD_NAME, errorHandler)
        .isLessThanMaximumDifferentApprovedAmount()
      var errors = errorHandler.get()
      expect(errors).to.equal(false)
      done()
    })

    it('should return an error object if passed a value greater than 250', function (done) {
      var errorHandler = ErrorHandler()
      FieldValidator(INVALID_INPUT, FIELD_NAME, errorHandler)
        .isLessThanMaximumDifferentApprovedAmount()
      var errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })
  })
})
