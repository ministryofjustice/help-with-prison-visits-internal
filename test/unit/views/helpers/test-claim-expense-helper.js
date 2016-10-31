var expect = require('chai').expect
var getExpenseFormatted = require('../../../../app/views/helpers/claim-expense-helper')

describe('views/claim-expense-helper', function () {
  describe('format expense', function () {
    it('should format expense type to return string of expense details', function () {
      var data = [
        {
          ExpenseType: 'bus',
          IsReturn: true,
          From: 'Test',
          To: 'Test2'
        },
        {
          ExpenseType: 'accommodation',
          DurationOfTravel: 2
        }
      ]
      expect(getExpenseFormatted(data[0])).to.equal('Test to Test2 - Return')
      expect(getExpenseFormatted(data[1])).to.equal('Nights stayed: 2')
    })
  })
})
