var expect = require('chai').expect
const moment = require('moment')
var checkLastUpdated = require('../../../app/services/check-last-updated')

describe('services/check-last-updated', function () {
  it('should return false if dates are the same', function () {
    var currentLastUpdated = moment().toDate()
    var previousLastUpdated = moment().toString()
    expect(checkLastUpdated(currentLastUpdated, previousLastUpdated)).to.be.false
  })

  it('should return true if dates are different', function () {
    var currentLastUpdated = moment().toDate()
    var previousLastUpdated = moment().add('1', 'day').toString()
    expect(checkLastUpdated(currentLastUpdated, previousLastUpdated)).to.be.true
  })
})
