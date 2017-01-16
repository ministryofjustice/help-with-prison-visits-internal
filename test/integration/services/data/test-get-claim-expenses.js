var expect = require('chai').expect
var moment = require('moment')
var databaseHelper = require('../../../helpers/database-setup-for-tests')

var getClaimExpenses = require('../../../../app/services/data/get-claim-expenses')
var reference = 'GETEXPENSE'
var claimId
var claimExpenseId1
var claimExpenseId2

describe('services/data/get-claim-expenses', function () {
  before(function () {
    return databaseHelper.insertTestData(reference, moment().toDate(), 'TESTING')
      .then(function (ids) {
        claimId = ids.claimId
        claimExpenseId1 = ids.expenseId1
        claimExpenseId2 = ids.expenseId2
      })
  })

  it('should return the expected claim expenses', function () {
    return getClaimExpenses(claimId)
      .then(function (result) {
        expect(claimExpenseFound(claimExpenseId1, result)).to.be.true
        expect(claimExpenseFound(claimExpenseId2, result)).to.be.true
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
  return claimExpenses.filter(function (expense) {
    if (expense.ClaimExpenseId === claimExpenseId) {
      return expense
    }
  }).length > 0
}
