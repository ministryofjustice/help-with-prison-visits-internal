var expect = require('chai').expect
const dateFormatter = require('../../../app/services/date-formatter')
var checkLastUpdated = require('../../../app/services/check-last-updated')

describe('services/check-last-updated', function () {
  it('should return false if dates are the same', function () {
    var currentLastUpdated = dateFormatter.now().toDate()
    var previousLastUpdated = dateFormatter.now().toString()
    expect(checkLastUpdated(currentLastUpdated, previousLastUpdated)).to.be.false
  })

  it('should return true if dates are different', function () {
    var currentLastUpdated = dateFormatter.now().toDate()
    var previousLastUpdated = dateFormatter.now().add('1', 'day').toString()
    expect(checkLastUpdated(currentLastUpdated, previousLastUpdated)).to.be.true
  })
})
