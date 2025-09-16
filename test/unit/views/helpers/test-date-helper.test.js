const getDateFormatted = require('../../../../app/views/helpers/date-helper')

// Javascript date class month is zero indexed which is why month entered into date is 10 instead of 11
describe('views/helpers/date-helper', () => {
  describe('shortDate', () => {
    it('should change date to format DD/MM/YYYY', () => {
      expect(getDateFormatted.shortDate(new Date(2016, 10, 10))).toBe('10/11/2016')
    })
  })
  describe('longDate', () => {
    it('should change date to Day Month Year format', () => {
      expect(getDateFormatted.longDate(new Date(2016, 10, 10))).toBe('10th November 2016')
    })
  })

  describe('shortDateAndTime', () => {
    it('should change date to DD/MM/YY HH:mm', () => {
      expect(getDateFormatted.shortDateAndTime(new Date(2016, 10, 10, 10, 10))).toBe('10/11/16 10:10')
    })
  })
})
