var expect = require('chai').expect
const dateFormatter = require('../../../app/services/date-formatter')
var checkUserAndLastUpdated = require('../../../app/services/check-user-and-last-updated')
var ValidationError = require('../../../app/services/errors/validation-error')

describe('services/check-user-and-last-updated', function () {
  it('should resolve if all details are correct', function () {
    var lastUpdatedData = {LastUpdated: dateFormatter.now().toDate()}
    var previousLastUpdated = dateFormatter.now().toString()
    expect(checkUserAndLastUpdated(lastUpdatedData, previousLastUpdated, false, 'test@test.com')).to.be.ok
  })

  it('should throw validation error if lastUpdated is different', function () {
    var lastUpdatedData = {LastUpdated: dateFormatter.now().toDate()}
    var previousLastUpdated = dateFormatter.now().add('1', 'day').toString()
    try {
      checkUserAndLastUpdated(lastUpdatedData, previousLastUpdated, false, 'test@test.com')
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
    }
  })
})
