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
      const errorHandler = ErrorHandler()
      FieldValidator(null, FIELD_NAME, errorHandler)
        .isRequired()
      const errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })

    it('should return an error object if passed undefined', function (done) {
      const errorHandler = ErrorHandler()
      FieldValidator(undefined, FIELD_NAME, errorHandler)
        .isRequired()
      const errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })

    it('should throw error if data is an object', function (done) {
      const errorHandler = ErrorHandler()
      FieldValidator({}, FIELD_NAME, errorHandler)
        .isRequired()
      const errors = errorHandler.get()
      expect(errors).to.equal(false)
      done()
    })

    it('should return an error if passed invalid data with a specific message', function () {
      const errorHandler = ErrorHandler()
      FieldValidator(null, FIELD_NAME, errorHandler)
        .isRequired(ERROR_MESSAGES.getRadioQuestionIsRequired)
      const errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      expect(errors[FIELD_NAME]).to.include(ERROR_MESSAGES.getRadioQuestionIsRequired())
    })

    it('should return false if passed valid data', function (done) {
      const errorHandler = ErrorHandler()
      FieldValidator(VALID_ALPHA, FIELD_NAME, errorHandler)
        .isRequired()
      const errors = errorHandler.get()
      expect(errors).to.equal(false)
      done()
    })

    it('should return an error object if passed invalid data', function (done) {
      const errorHandler = ErrorHandler()
      FieldValidator(INVALID_DATA, FIELD_NAME, errorHandler)
        .isRequired()
      const errors = errorHandler.get()
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
      const errorHandler = ErrorHandler()
      FieldValidator(VALID_NUMERIC, FIELD_NAME, errorHandler)
        .isNumeric()
      const errors = errorHandler.get()
      expect(errors).to.equal(false)
      done()
    })

    it('should return an error object if passed invalid data', function (done) {
      const errorHandler = ErrorHandler()
      FieldValidator(INVALID_DATA, FIELD_NAME, errorHandler)
        .isNumeric()
      const errors = errorHandler.get()
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
      const errorHandler = ErrorHandler()
      FieldValidator(VALID_INPUT, FIELD_NAME, errorHandler)
        .isCurrency()
      const errors = errorHandler.get()
      expect(errors).to.equal(false)
      done()
    })

    it('should return an error object if passed invalid data', function (done) {
      const errorHandler = ErrorHandler()
      FieldValidator(INVALID_INPUT, FIELD_NAME, errorHandler)
        .isCurrency()
      const errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })
  })

  describe('isGreaterThanZero', function () {
    const VALID_INPUT = '20'
    const INVALID_INPUT = '0'

    it('should return an error object if passed null', function (done) {
      const errorHandler = ErrorHandler()
      FieldValidator(null, FIELD_NAME, errorHandler)
        .isGreaterThanZero()
      const errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })

    it('should return an error object if passed undefined', function (done) {
      const errorHandler = ErrorHandler()
      FieldValidator(undefined, FIELD_NAME, errorHandler)
        .isGreaterThanZero()
      const errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })

    it('should return an error object if passed an object', function (done) {
      const errorHandler = ErrorHandler()
      FieldValidator({}, FIELD_NAME, errorHandler)
        .isGreaterThanZero()
      const errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })

    it('should return false if passed a numeric value greater than zero', function (done) {
      const errorHandler = ErrorHandler()
      FieldValidator(VALID_INPUT, FIELD_NAME, errorHandler)
        .isGreaterThanZero()
      const errors = errorHandler.get()
      expect(errors).to.equal(false)
      done()
    })

    it('should return an error object if passed a value less than or equal to zero', function (done) {
      const errorHandler = ErrorHandler()
      FieldValidator(INVALID_INPUT, FIELD_NAME, errorHandler)
        .isGreaterThanZero()
      const errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })
  })

  describe('isGreaterThanMinimumClaim', function () {
    const VALID_INPUT = '2'
    const INVALID_INPUT = '-0.01'

    it('should return an error object if passed null', function (done) {
      const errorHandler = ErrorHandler()
      FieldValidator(null, FIELD_NAME, errorHandler)
        .isGreaterThanMinimumClaim()
      const errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })

    it('should return an error object if passed undefined', function (done) {
      const errorHandler = ErrorHandler()
      FieldValidator(undefined, FIELD_NAME, errorHandler)
        .isGreaterThanMinimumClaim()
      const errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })

    it('should return an error object if passed an object', function (done) {
      const errorHandler = ErrorHandler()
      FieldValidator({}, FIELD_NAME, errorHandler)
        .isGreaterThanMinimumClaim()
      const errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })

    it('should return false if passed a numeric value greater than one', function (done) {
      const errorHandler = ErrorHandler()
      FieldValidator(VALID_INPUT, FIELD_NAME, errorHandler)
        .isGreaterThanMinimumClaim()
      const errors = errorHandler.get()
      expect(errors).to.equal(false)
      done()
    })

    it('should return an error object if passed a value less than zero', function (done) {
      const errorHandler = ErrorHandler()
      FieldValidator(INVALID_INPUT, FIELD_NAME, errorHandler)
        .isGreaterThanMinimumClaim()
      const errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })
  })

  describe('isLessThanMaximumDifferentApprovedAmount', function () {
    const VALID_INPUT = '20'
    const INVALID_INPUT = '300'

    it('should return an error object if passed null', function (done) {
      const errorHandler = ErrorHandler()
      FieldValidator(null, FIELD_NAME, errorHandler)
        .isLessThanMaximumDifferentApprovedAmount()
      const errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })

    it('should return an error object if passed undefined', function (done) {
      const errorHandler = ErrorHandler()
      FieldValidator(undefined, FIELD_NAME, errorHandler)
        .isLessThanMaximumDifferentApprovedAmount()
      const errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })

    it('should return an error object if passed an object', function (done) {
      const errorHandler = ErrorHandler()
      FieldValidator({}, FIELD_NAME, errorHandler)
        .isLessThanMaximumDifferentApprovedAmount()
      const errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })

    it('should return false if passed a numeric value greater than zero', function (done) {
      const errorHandler = ErrorHandler()
      FieldValidator(VALID_INPUT, FIELD_NAME, errorHandler)
        .isLessThanMaximumDifferentApprovedAmount()
      const errors = errorHandler.get()
      expect(errors).to.equal(false)
      done()
    })

    it('should return an error object if passed a value greater than 250', function (done) {
      const errorHandler = ErrorHandler()
      FieldValidator(INVALID_INPUT, FIELD_NAME, errorHandler)
        .isLessThanMaximumDifferentApprovedAmount()
      const errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
      done()
    })
  })

  describe('isEmail', function () {
    const VALID_EMAIL = 'test1@tester.com'
    const INVALID_FORMAT_DATA = 'AAAAAA1'

    it('should throw error if data is null', function () {
      expect(function () {
        FieldValidator(null, FIELD_NAME, ERROR_HANDLER)
          .isEmail()
      }).to.throw(TypeError)
    })

    it('should throw error if data is undefined', function () {
      expect(function () {
        FieldValidator(undefined, FIELD_NAME, ERROR_HANDLER)
          .isEmail()
      }).to.throw(TypeError)
    })

    it('should throw error if data is an object', function () {
      expect(function () {
        FieldValidator({}, FIELD_NAME, ERROR_HANDLER)
          .isEmail()
      }).to.throw(TypeError)
    })

    it('should return false if passed valid data', function () {
      const errorHandler = ErrorHandler()
      FieldValidator(VALID_EMAIL, FIELD_NAME, errorHandler)
        .isEmail()
      const errors = errorHandler.get()
      expect(errors).to.equal(false)
    })

    it('should return an error object if passed invalid data', function () {
      const errorHandler = ErrorHandler()
      FieldValidator(INVALID_FORMAT_DATA, FIELD_NAME, errorHandler)
        .isEmail()
      const errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
    })
  })

  describe('isLessThanLength', function () {
    const ACCEPTED_LENGTH = '10'
    const VALID_LENGTH = '11111'
    const INVALID_LENGTH = '111111111111111'

    it('should throw error if data is null', function () {
      expect(function () {
        FieldValidator(null, FIELD_NAME, ERROR_HANDLER)
          .isLessThanLength()
      }).to.throw(TypeError)
    })

    it('should throw error if data is undefined', function () {
      expect(function () {
        FieldValidator(undefined, FIELD_NAME, ERROR_HANDLER)
          .isLessThanLength()
      }).to.throw(TypeError)
    })

    it('should throw error if data is an object', function () {
      expect(function () {
        FieldValidator({}, FIELD_NAME, ERROR_HANDLER)
          .isLessThanLength()
      }).to.throw(TypeError)
    })

    it('should return false if passed valid data', function () {
      const errorHandler = ErrorHandler()
      FieldValidator(VALID_LENGTH, FIELD_NAME, errorHandler)
        .isLessThanLength(ACCEPTED_LENGTH)
      const errors = errorHandler.get()
      expect(errors).to.equal(false)
    })

    it('should return an error object if passed invalid data', function () {
      const errorHandler = ErrorHandler()
      FieldValidator(INVALID_LENGTH, FIELD_NAME, errorHandler)
        .isLessThanLength(ACCEPTED_LENGTH)
      const errors = errorHandler.get()
      expect(errors).to.have.property(FIELD_NAME)
    })
  })
})
