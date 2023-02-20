const expect = require('chai').expect
const dateFormatter = require('../../../../app/services/date-formatter')
const { insertTestData, deleteAll } = require('../../../helpers/database-setup-for-tests')

const getClaimExpenses = require('../../../../app/services/data/get-claim-expenses')
const reference = 'GETEXP'
let claimId
let claimExpenseId1
let claimExpenseId2

describe('services/data/get-claim-expenses', function () {
  before(function () {
    return insertTestData(reference, dateFormatter.now().toDate(), 'TESTING')
      .then(function (ids) {
        claimId = ids.claimId
        claimExpenseId1 = ids.expenseId1
        claimExpenseId2 = ids.expenseId2
      })
  })

  it('should return the expected claim expenses', function () {
    return getClaimExpenses(claimId)
      .then(function (result) {
        const claimExpense1Found = claimExpenseFound(claimExpenseId1, result)
        const claimExpense2Found = claimExpenseFound(claimExpenseId2, result)

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
        const fields = Object.keys(result[0])

        expect(fields).to.contain('ClaimExpenseId')
        expect(fields).to.contain('ExpenseType')
        expect(fields).to.contain('ApprovedCost')
      })
      .catch(function (error) {
        throw error
      })
  })

  after(function () {
    return deleteAll(reference)
  })
})

function claimExpenseFound (claimExpenseId, claimExpenses) {
  let result = false

  claimExpenses.forEach(function (claimExpense) {
    if (claimExpense.ClaimExpenseId === claimExpenseId) {
      result = true
    }
  })

  return result
}
