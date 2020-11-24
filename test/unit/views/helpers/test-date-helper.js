const expect = require('chai').expect
const getDateFormatted = require('../../../../app/views/helpers/date-helper')

// Javascript date class month is zero indexed which is why month entered into date is 10 instead of 11
describe('views/helpers/date-helper', function () {
  describe('shortDate', function () {
    it('should change date to format DD/MM/YYYY', function () {
      expect(getDateFormatted.shortDate(new Date(2016, 10, 10))).to.equal('10/11/2016')
    })
  })
  describe('longDate', function () {
    it('should change date to Day Month Year format', function () {
      expect(getDateFormatted.longDate(new Date(2016, 10, 10))).to.equal('10th November 2016')
    })
  })

  describe('shortDateAndTime', function () {
    it('should change date to DD/MM/YY HH:mm', function () {
      expect(getDateFormatted.shortDateAndTime(new Date(2016, 10, 10, 10, 10))).to.equal('10/11/16 10:10')
    })
  })
})
