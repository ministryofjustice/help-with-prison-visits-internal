const expect = require('chai').expect
const validator = require('../../../../app/services/validators/common-validator')

describe('services/validators/common-validator', function () {
  const ALPHA_STRING = 'apvs'
  const NUMERIC_STRING = '123'
  const ALPHANUMERIC_STRING = 'apvs123'
  const DECIMAL_STRING = '0.1'

  describe('isNullOrUndefined', function () {
    it('should return true if passed null', function (done) {
      const result = validator.isNullOrUndefined(null)
      expect(result).to.equal(true)
      done()
    })

    it('should return true if passed undefined', function (done) {
      const result = validator.isNullOrUndefined(undefined)
      expect(result).to.equal(true)
      done()
    })

    it('should return true if passed an empty string', function (done) {
      const result = validator.isNullOrUndefined('')
      expect(result).to.equal(true)
      done()
    })

    it('should return false if passed an object', function (done) {
      const result = validator.isNullOrUndefined({})
      expect(result).to.equal(false)
      done()
    })

    it('should return false if passed an array', function (done) {
      const result = validator.isNullOrUndefined([])
      expect(result).to.equal(false)
      done()
    })

    it('should return false if passed a non empty string', function (done) {
      const result = validator.isNullOrUndefined('any string')
      expect(result).to.equal(false)
      done()
    })
  })

  describe('isNumeric', function () {
    it('should throw an error if passed null', function (done) {
      expect(function () {
        validator.isNumeric(null)
      }).to.throw(TypeError)
      done()
    })

    it('should throw an error if passed undefined', function (done) {
      expect(function () {
        validator.isNumeric(undefined)
      }).to.throw(TypeError)
      done()
    })

    it('should throw an error if passed an object', function (done) {
      expect(function () {
        validator.isNumeric({})
      }).to.throw(TypeError)
      done()
    })

    it('should return false if passed an alpha string', function (done) {
      const result = validator.isNumeric(ALPHA_STRING)
      expect(result).to.equal(false)
      done()
    })

    it('should return false if passed an alphanumeric string', function (done) {
      const result = validator.isNumeric(ALPHANUMERIC_STRING)
      expect(result).to.equal(false)
      done()
    })

    it('should return true if passed a numeric string', function (done) {
      const result = validator.isNumeric(NUMERIC_STRING)
      expect(result).to.equal(true)
      done()
    })

    it('should return true if passed a decimal string', function (done) {
      const result = validator.isNumeric(DECIMAL_STRING)
      expect(result).to.equal(true)
      done()
    })
  })

  describe('isCurrency', function () {
    const VALID_INTEGER = '20'
    const VALID_DECIMAL = '20.00'
    const INVALID_STRING = 'invalid'

    it('should throw an error if passed null', function (done) {
      expect(function () {
        validator.isCurrency(null)
      }).to.throw(TypeError)
      done()
    })

    it('should throw an error if passed undefined', function (done) {
      expect(function () {
        validator.isCurrency(undefined)
      }).to.throw(TypeError)
      done()
    })

    it('should throw an error if passed an object', function (done) {
      expect(function () {
        validator.isCurrency({})
      }).to.throw(TypeError)
      done()
    })

    it('should return true if passed a numeric string', function (done) {
      const result = validator.isCurrency(VALID_INTEGER)
      expect(result).to.equal(true)
      done()
    })

    it('should return true if passed a numeric string to 2 decimal places', function (done) {
      const result = validator.isCurrency(VALID_DECIMAL)
      expect(result).to.equal(true)
      done()
    })

    it('should return false if passed a non-numeric string', function (done) {
      const result = validator.isCurrency(INVALID_STRING)
      expect(result).to.equal(false)
      done()
    })
  })

  describe('isGreaterThanZero', function () {
    const VALID_NUMERIC = '20'
    const VALID_FLOAT = '7.99'
    const INVALID_NUMERIC = '-20'
    const INVALID_STRING = 'some invalid string'

    it('should return false if passed null', function (done) {
      const result = validator.isGreaterThanZero(null)
      expect(result).to.equal(false)
      done()
    })

    it('should return false if passed undefined', function (done) {
      const result = validator.isGreaterThanZero(undefined)
      expect(result).to.equal(false)
      done()
    })

    it('should return false if passed an object', function (done) {
      const result = validator.isGreaterThanZero({})
      expect(result).to.equal(false)
      done()
    })

    it('should return true if passed a numeric string that is greater than zero', function (done) {
      const result = validator.isGreaterThanZero(VALID_NUMERIC)
      expect(result).to.equal(true)
      done()
    })

    it('should return true if passed a float that is greater than zero', function (done) {
      const result = validator.isGreaterThanZero(VALID_FLOAT)
      expect(result).to.equal(true)
      done()
    })

    it('should return false if passed a negative numeric string', function (done) {
      const result = validator.isGreaterThanZero(INVALID_NUMERIC)
      expect(result).to.equal(false)
      done()
    })

    it('should return false if passed a non-numeric string', function (done) {
      const result = validator.isGreaterThanZero(INVALID_STRING)
      expect(result).to.equal(false)
      done()
    })
  })

  describe('isGreaterThanMinimumClaim', function () {
    const VALID_NUMERIC = '2'
    const VALID_FLOAT = '2.99'
    const INVALID_NUMERIC = '-2'
    const INVALID_STRING = 'some invalid string'

    it('should return false if passed null', function (done) {
      const result = validator.isGreaterThanMinimumClaim(null)
      expect(result).to.equal(false)
      done()
    })

    it('should return false if passed undefined', function (done) {
      const result = validator.isGreaterThanMinimumClaim(undefined)
      expect(result).to.equal(false)
      done()
    })

    it('should return false if passed an object', function (done) {
      const result = validator.isGreaterThanMinimumClaim({})
      expect(result).to.equal(false)
      done()
    })

    it('should return true if passed a numeric string that is greater than one', function (done) {
      const result = validator.isGreaterThanMinimumClaim(VALID_NUMERIC)
      expect(result).to.equal(true)
      done()
    })

    it('should return true if passed a float that is greater than one', function (done) {
      const result = validator.isGreaterThanMinimumClaim(VALID_FLOAT)
      expect(result).to.equal(true)
      done()
    })

    it('should return false if passed a negative numeric string', function (done) {
      const result = validator.isGreaterThanMinimumClaim(INVALID_NUMERIC)
      expect(result).to.equal(false)
      done()
    })

    it('should return false if passed a non-numeric string', function (done) {
      const result = validator.isGreaterThanMinimumClaim(INVALID_STRING)
      expect(result).to.equal(false)
      done()
    })
  })

  describe('isLessThanMaximumDifferentApprovedAmount', function () {
    const VALID_NUMERIC = '20'
    const VALID_FLOAT = '7.99'
    const INVALID_NUMERIC = '1000'
    const INVALID_STRING = 'some invalid string'

    it('should return false if passed null', function (done) {
      const result = validator.isLessThanMaximumDifferentApprovedAmount(null)
      expect(result).to.equal(false)
      done()
    })

    it('should return false if passed undefined', function (done) {
      const result = validator.isLessThanMaximumDifferentApprovedAmount(undefined)
      expect(result).to.equal(false)
      done()
    })

    it('should return false if passed an object', function (done) {
      const result = validator.isLessThanMaximumDifferentApprovedAmount({})
      expect(result).to.equal(false)
      done()
    })

    it('should return true if passed a numeric string that is greater than zero', function (done) {
      const result = validator.isLessThanMaximumDifferentApprovedAmount(VALID_NUMERIC)
      expect(result).to.equal(true)
      done()
    })

    it('should return true if passed a float that is greater than zero', function (done) {
      const result = validator.isLessThanMaximumDifferentApprovedAmount(VALID_FLOAT)
      expect(result).to.equal(true)
      done()
    })

    it('should return false if passed a negative numeric string', function (done) {
      const result = validator.isLessThanMaximumDifferentApprovedAmount(INVALID_NUMERIC)
      expect(result).to.equal(false)
      done()
    })

    it('should return false if passed a non-numeric string', function (done) {
      const result = validator.isLessThanMaximumDifferentApprovedAmount(INVALID_STRING)
      expect(result).to.equal(false)
      done()
    })
  })

  describe('isEmail', function () {
    const VALID_STRING = 'test@test.com'
    const INVALID_STRING = 'test.test.com'

    it('should throw an error if passed null', function () {
      expect(function () {
        validator.isEmail(null)
      }).to.throw(TypeError)
    })

    it('should throw an error if passed undefined', function () {
      expect(function () {
        validator.isEmail(undefined)
      }).to.throw(TypeError)
    })

    it('should throw an error if passed an object', function () {
      expect(function () {
        validator.isEmail({})
      }).to.throw(TypeError)
    })

    it('should return true if passed a string that has a valid format', function () {
      const result = validator.isEmail(VALID_STRING)
      expect(result).to.equal(true)
    })

    it('should return false if passed a string that has an invalid format', function () {
      const result = validator.isEmail(INVALID_STRING)
      expect(result).to.equal(false)
    })
  })

  describe('isLessThanLength', function () {
    const LENGTH = 10
    const VALID_STRING = '11111'
    const INVALID_STRING = '11111111111111111111'

    it('should throw an error if passed null', function () {
      expect(function () {
        validator.isLessThanLength(null, null)
      }).to.throw(TypeError)
    })

    it('should throw an error if passed undefined', function () {
      expect(function () {
        validator.isLessThanLength(undefined, undefined)
      }).to.throw(TypeError)
    })

    it('should throw an error if passed an object', function () {
      expect(function () {
        validator.isLessThanLength({}, {})
      }).to.throw(TypeError)
    })

    it('should return true if passed a string that has a valid length', function () {
      const result = validator.isLessThanLength(VALID_STRING, LENGTH)
      expect(result).to.equal(true)
    })

    it('should return false if passed a string that has an invalid length', function () {
      const result = validator.isLessThanLength(INVALID_STRING, LENGTH)
      expect(result).to.equal(false)
    })
  })
})
