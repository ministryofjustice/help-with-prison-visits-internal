const FieldValidator = require('../../../../app/services/validators/field-validator')
const ErrorHandler = require('../../../../app/services/validators/error-handler')
const ERROR_MESSAGES = require('../../../../app/services/validators/validation-error-messages')

describe('services/validators/field-validator', () => {
  const VALID_ALPHA = 'data'
  const VALID_NUMERIC = '1'
  const INVALID_DATA = ''
  const FIELD_NAME = 'field name'
  const ERROR_HANDLER = ErrorHandler()

  describe('isRequired', () => {
    it('should return an error object if passed null', done => {
      const errorHandler = ErrorHandler()
      FieldValidator(null, FIELD_NAME, errorHandler).isRequired()
      const errors = errorHandler.get()
      expect(errors).toHaveProperty(FIELD_NAME)
      done()
    })

    it('should return an error object if passed undefined', done => {
      const errorHandler = ErrorHandler()
      FieldValidator(undefined, FIELD_NAME, errorHandler).isRequired()
      const errors = errorHandler.get()
      expect(errors).toHaveProperty(FIELD_NAME)
      done()
    })

    it('should throw error if data is an object', done => {
      const errorHandler = ErrorHandler()
      FieldValidator({}, FIELD_NAME, errorHandler).isRequired()
      const errors = errorHandler.get()
      expect(errors).toBe(false)
      done()
    })

    it('should return an error if passed invalid data with a specific message', () => {
      const errorHandler = ErrorHandler()
      FieldValidator(null, FIELD_NAME, errorHandler).isRequired(ERROR_MESSAGES.getRadioQuestionIsRequired)
      const errors = errorHandler.get()
      expect(errors).toHaveProperty(FIELD_NAME)
      expect(errors[FIELD_NAME]).toContain(ERROR_MESSAGES.getRadioQuestionIsRequired())
    })

    it('should return false if passed valid data', done => {
      const errorHandler = ErrorHandler()
      FieldValidator(VALID_ALPHA, FIELD_NAME, errorHandler).isRequired()
      const errors = errorHandler.get()
      expect(errors).toBe(false)
      done()
    })

    it('should return an error object if passed invalid data', done => {
      const errorHandler = ErrorHandler()
      FieldValidator(INVALID_DATA, FIELD_NAME, errorHandler).isRequired()
      const errors = errorHandler.get()
      expect(errors).toHaveProperty(FIELD_NAME)
      done()
    })
  })

  describe('isNumeric', () => {
    it('should throw error if data is null', done => {
      expect(() => {
        FieldValidator(null, FIELD_NAME, ERROR_HANDLER).isNumeric()
      }).toThrow(TypeError)
      done()
    })

    it('should throw error if data is undefined', done => {
      expect(() => {
        FieldValidator(undefined, FIELD_NAME, ERROR_HANDLER).isNumeric()
      }).toThrow(TypeError)
      done()
    })

    it('should throw error if data is an object', done => {
      expect(() => {
        FieldValidator({}, FIELD_NAME, ERROR_HANDLER).isNumeric()
      }).toThrow(TypeError)
      done()
    })

    it('should return false if passed valid data', done => {
      const errorHandler = ErrorHandler()
      FieldValidator(VALID_NUMERIC, FIELD_NAME, errorHandler).isNumeric()
      const errors = errorHandler.get()
      expect(errors).toBe(false)
      done()
    })

    it('should return an error object if passed invalid data', done => {
      const errorHandler = ErrorHandler()
      FieldValidator(INVALID_DATA, FIELD_NAME, errorHandler).isNumeric()
      const errors = errorHandler.get()
      expect(errors).toHaveProperty(FIELD_NAME)
      done()
    })
  })

  describe('isCurrency', () => {
    const VALID_INPUT = '20'
    const INVALID_INPUT = 'invalid'

    it('should throw error if data is null', done => {
      expect(() => {
        FieldValidator(null, FIELD_NAME, ERROR_HANDLER).isCurrency()
      }).toThrow(TypeError)
      done()
    })

    it('should throw error if data is undefined', done => {
      expect(() => {
        FieldValidator(undefined, FIELD_NAME, ERROR_HANDLER).isCurrency()
      }).toThrow(TypeError)
      done()
    })

    it('should throw error if data is an object', done => {
      expect(() => {
        FieldValidator({}, FIELD_NAME, ERROR_HANDLER).isCurrency()
      }).toThrow(TypeError)
      done()
    })

    it('should return false if passed valid data', done => {
      const errorHandler = ErrorHandler()
      FieldValidator(VALID_INPUT, FIELD_NAME, errorHandler).isCurrency()
      const errors = errorHandler.get()
      expect(errors).toBe(false)
      done()
    })

    it('should return an error object if passed invalid data', done => {
      const errorHandler = ErrorHandler()
      FieldValidator(INVALID_INPUT, FIELD_NAME, errorHandler).isCurrency()
      const errors = errorHandler.get()
      expect(errors).toHaveProperty(FIELD_NAME)
      done()
    })
  })

  describe('isGreaterThanZero', () => {
    const VALID_INPUT = '20'
    const INVALID_INPUT = '0'

    it('should return an error object if passed null', done => {
      const errorHandler = ErrorHandler()
      FieldValidator(null, FIELD_NAME, errorHandler).isGreaterThanZero()
      const errors = errorHandler.get()
      expect(errors).toHaveProperty(FIELD_NAME)
      done()
    })

    it('should return an error object if passed undefined', done => {
      const errorHandler = ErrorHandler()
      FieldValidator(undefined, FIELD_NAME, errorHandler).isGreaterThanZero()
      const errors = errorHandler.get()
      expect(errors).toHaveProperty(FIELD_NAME)
      done()
    })

    it('should return an error object if passed an object', done => {
      const errorHandler = ErrorHandler()
      FieldValidator({}, FIELD_NAME, errorHandler).isGreaterThanZero()
      const errors = errorHandler.get()
      expect(errors).toHaveProperty(FIELD_NAME)
      done()
    })

    it('should return false if passed a numeric value greater than zero', done => {
      const errorHandler = ErrorHandler()
      FieldValidator(VALID_INPUT, FIELD_NAME, errorHandler).isGreaterThanZero()
      const errors = errorHandler.get()
      expect(errors).toBe(false)
      done()
    })

    it('should return an error object if passed a value less than or equal to zero', done => {
      const errorHandler = ErrorHandler()
      FieldValidator(INVALID_INPUT, FIELD_NAME, errorHandler).isGreaterThanZero()
      const errors = errorHandler.get()
      expect(errors).toHaveProperty(FIELD_NAME)
      done()
    })
  })

  describe('isGreaterThanMinimumClaim', () => {
    const VALID_INPUT = '2'
    const INVALID_INPUT = '-0.01'

    it('should return an error object if passed null', done => {
      const errorHandler = ErrorHandler()
      FieldValidator(null, FIELD_NAME, errorHandler).isGreaterThanMinimumClaim()
      const errors = errorHandler.get()
      expect(errors).toHaveProperty(FIELD_NAME)
      done()
    })

    it('should return an error object if passed undefined', done => {
      const errorHandler = ErrorHandler()
      FieldValidator(undefined, FIELD_NAME, errorHandler).isGreaterThanMinimumClaim()
      const errors = errorHandler.get()
      expect(errors).toHaveProperty(FIELD_NAME)
      done()
    })

    it('should return an error object if passed an object', done => {
      const errorHandler = ErrorHandler()
      FieldValidator({}, FIELD_NAME, errorHandler).isGreaterThanMinimumClaim()
      const errors = errorHandler.get()
      expect(errors).toHaveProperty(FIELD_NAME)
      done()
    })

    it('should return false if passed a numeric value greater than one', done => {
      const errorHandler = ErrorHandler()
      FieldValidator(VALID_INPUT, FIELD_NAME, errorHandler).isGreaterThanMinimumClaim()
      const errors = errorHandler.get()
      expect(errors).toBe(false)
      done()
    })

    it('should return an error object if passed a value less than zero', done => {
      const errorHandler = ErrorHandler()
      FieldValidator(INVALID_INPUT, FIELD_NAME, errorHandler).isGreaterThanMinimumClaim()
      const errors = errorHandler.get()
      expect(errors).toHaveProperty(FIELD_NAME)
      done()
    })
  })

  describe('isLessThanMaximumDifferentApprovedAmount', () => {
    const VALID_INPUT = '20'
    const INVALID_INPUT = '300'

    it('should return an error object if passed null', done => {
      const errorHandler = ErrorHandler()
      FieldValidator(null, FIELD_NAME, errorHandler).isLessThanMaximumDifferentApprovedAmount()
      const errors = errorHandler.get()
      expect(errors).toHaveProperty(FIELD_NAME)
      done()
    })

    it('should return an error object if passed undefined', done => {
      const errorHandler = ErrorHandler()
      FieldValidator(undefined, FIELD_NAME, errorHandler).isLessThanMaximumDifferentApprovedAmount()
      const errors = errorHandler.get()
      expect(errors).toHaveProperty(FIELD_NAME)
      done()
    })

    it('should return an error object if passed an object', done => {
      const errorHandler = ErrorHandler()
      FieldValidator({}, FIELD_NAME, errorHandler).isLessThanMaximumDifferentApprovedAmount()
      const errors = errorHandler.get()
      expect(errors).toHaveProperty(FIELD_NAME)
      done()
    })

    it('should return false if passed a numeric value greater than zero', done => {
      const errorHandler = ErrorHandler()
      FieldValidator(VALID_INPUT, FIELD_NAME, errorHandler).isLessThanMaximumDifferentApprovedAmount()
      const errors = errorHandler.get()
      expect(errors).toBe(false)
      done()
    })

    it('should return an error object if passed a value greater than 250', done => {
      const errorHandler = ErrorHandler()
      FieldValidator(INVALID_INPUT, FIELD_NAME, errorHandler).isLessThanMaximumDifferentApprovedAmount()
      const errors = errorHandler.get()
      expect(errors).toHaveProperty(FIELD_NAME)
      done()
    })
  })

  describe('isEmail', () => {
    const VALID_EMAIL = 'test1@tester.com'
    const INVALID_FORMAT_DATA = 'AAAAAA1'

    it('should throw error if data is null', () => {
      expect(() => {
        FieldValidator(null, FIELD_NAME, ERROR_HANDLER).isEmail()
      }).toThrow(TypeError)
    })

    it('should throw error if data is undefined', () => {
      expect(() => {
        FieldValidator(undefined, FIELD_NAME, ERROR_HANDLER).isEmail()
      }).toThrow(TypeError)
    })

    it('should throw error if data is an object', () => {
      expect(() => {
        FieldValidator({}, FIELD_NAME, ERROR_HANDLER).isEmail()
      }).toThrow(TypeError)
    })

    it('should return false if passed valid data', () => {
      const errorHandler = ErrorHandler()
      FieldValidator(VALID_EMAIL, FIELD_NAME, errorHandler).isEmail()
      const errors = errorHandler.get()
      expect(errors).toBe(false)
    })

    it('should return an error object if passed invalid data', () => {
      const errorHandler = ErrorHandler()
      FieldValidator(INVALID_FORMAT_DATA, FIELD_NAME, errorHandler).isEmail()
      const errors = errorHandler.get()
      expect(errors).toHaveProperty(FIELD_NAME)
    })
  })

  describe('isLessThanLength', () => {
    const ACCEPTED_LENGTH = '10'
    const VALID_LENGTH = '11111'
    const INVALID_LENGTH = '111111111111111'

    it('should throw error if data is null', () => {
      expect(() => {
        FieldValidator(null, FIELD_NAME, ERROR_HANDLER).isLessThanLength()
      }).toThrow(TypeError)
    })

    it('should throw error if data is undefined', () => {
      expect(() => {
        FieldValidator(undefined, FIELD_NAME, ERROR_HANDLER).isLessThanLength()
      }).toThrow(TypeError)
    })

    it('should throw error if data is an object', () => {
      expect(() => {
        FieldValidator({}, FIELD_NAME, ERROR_HANDLER).isLessThanLength()
      }).toThrow(TypeError)
    })

    it('should return false if passed valid data', () => {
      const errorHandler = ErrorHandler()
      FieldValidator(VALID_LENGTH, FIELD_NAME, errorHandler).isLessThanLength(ACCEPTED_LENGTH)
      const errors = errorHandler.get()
      expect(errors).toBe(false)
    })

    it('should return an error object if passed invalid data', () => {
      const errorHandler = ErrorHandler()
      FieldValidator(INVALID_LENGTH, FIELD_NAME, errorHandler).isLessThanLength(ACCEPTED_LENGTH)
      const errors = errorHandler.get()
      expect(errors).toHaveProperty(FIELD_NAME)
    })
  })
})
