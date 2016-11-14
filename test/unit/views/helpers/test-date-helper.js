var expect = require('chai').expect
var getDateFormatted = require('../../../../app/views/helpers/date-helper')

// Javascript date class month is zero indexed which is why month entered into date is 10 instead of 11
describe('views/date-helper', function () {
  describe('format date', function () {
    it('should change date to format DD/MM/YYYY', function () {
      expect(getDateFormatted(new Date(2016, 10, 10))).to.equal('10/11/2016')
    })
  })
})
