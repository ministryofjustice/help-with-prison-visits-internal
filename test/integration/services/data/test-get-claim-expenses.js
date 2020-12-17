var expect = require('chai').expect
var dateFormatter = require('../../../../app/services/date-formatter')
var databaseHelper = require('../../../helpers/database-setup-for-tests')

var getClaimExpenses = require('../../../../app/services/data/get-claim-expenses')
var reference = 'GETEXP'
var claimId
var claimExpenseId1
var claimExpenseId2

describe('services/data/get-claim-expenses', function () {
  before(function () {
    return databaseHelper.insertTestData(reference, dateFormatter.now().toDate(), 'TESTING')
      .then(function (ids) {
        claimId = ids.claimId
        claimExpenseId1 = ids.expenseId1
        claimExpenseId2 = ids.expenseId2
      })
  })

  it('should return the expected claim expenses', function () {
    return getClaimExpenses(claimId)
      .then(function (result) {
        var claimExpense1Found = claimExpenseFound(claimExpenseId1, result)
        var claimExpense2Found = claimExpenseFound(claimExpenseId2, result)

        expect(claimExpense1Found).to.be.true //eslint-disable-line
        expect(claimExpense2Found).to.be.true //eslint-disable-line
        expect(result).to.be.lengthOf(2)
      })
      .catch(function (error) {
        throw error
      })
  })

  it('should return the expected fields', function () {
    return getClaimExpenses(claimId)
      .then(function (result) {
        var fields = Object.keys(result[0])

        expect(fields).to.contain('ClaimExpenseId')
        expect(fields).to.contain('ExpenseType')
        expect(fields).to.contain('ApprovedCost')
      })
      .catch(function (error) {
        throw error
      })
  })

  after(function () {
    return databaseHelper.deleteAll(reference)
  })
})

function claimExpenseFound (claimExpenseId, claimExpenses) {
  var result = false

  claimExpenses.forEach(function (claimExpense) {
    if (claimExpense.ClaimExpenseId === claimExpenseId) {
      result = true
    }
  })

  return result
}
