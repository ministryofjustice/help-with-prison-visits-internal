const ErrorHandler = require('../../../../app/services/validators/error-handler')

describe('services/validators/error-handler', function () {
  beforeEach(function () {
    this.errorHandler = ErrorHandler()
  })

  const FIELD_NAME_1 = 'some field name 1'
  const FIELD_NAME_2 = 'some field name 2'
  const MESSAGE = 'some error message'
  const OPTIONS = 'some options'
  const message = function () {
    return MESSAGE
  }

  describe('add', function () {
    it('should return single result if one error is added', function (done) {
      this.errorHandler.add(FIELD_NAME_1, message, OPTIONS)
      const result = this.errorHandler.get()
      expect(result).toHaveProperty(FIELD_NAME_1)
        .that.is.an('array').toHaveLength(1)
      done()
    })

    it('should have three errors saved against the field name if add is called three times', function (done) {
      this.errorHandler.add(FIELD_NAME_1, message, OPTIONS)
      this.errorHandler.add(FIELD_NAME_1, message, OPTIONS)
      this.errorHandler.add(FIELD_NAME_1, message, OPTIONS)
      const result = this.errorHandler.get()
      expect(result).toHaveProperty(FIELD_NAME_1)
        .that.is.an('array').toHaveLength(3)
      done()
    })

    it('should have a property and error for each differnet field name passed to add', function (done) {
      this.errorHandler.add(FIELD_NAME_1, message, OPTIONS)
      this.errorHandler.add(FIELD_NAME_2, message, OPTIONS)
      const result = this.errorHandler.get()
      expect(result).toHaveProperty(FIELD_NAME_1)
        .that.is.an('array').toHaveLength(1)
      expect(result).toHaveProperty(FIELD_NAME_2)
        .that.is.an('array').toHaveLength(1)
      done()
    })
  })

  describe('get', function () {
    it('should return false if no errors are added', function (done) {
      const result = this.errorHandler.get()
      expect(result).toBe(false)
      done()
    })
  })
})
