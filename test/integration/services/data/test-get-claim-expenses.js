const dateFormatter = require('../../../../app/services/date-formatter')
const { insertTestData, deleteAll } = require('../../../helpers/database-setup-for-tests')

const getClaimExpensesForClaims = require('../../../../app/services/data/get-claim-expenses-for-claims')
const reference = 'GETEXP'
let claimId
let claimExpenseId1
let claimExpenseId2

describe('services/data/get-claim-expenses', function () {
  beforeAll(function () {
    return insertTestData(reference, dateFormatter.now().toDate(), 'TESTING')
      .then(function (ids) {
        claimId = [ids.claimId]
        claimExpenseId1 = ids.expenseId1
        claimExpenseId2 = ids.expenseId2
      })
  })

  it('should return the expected claim expenses', function () {
    return getClaimExpensesForClaims(claimId)
      .then(function (result) {
        const claimExpense1Found = claimExpenseFound(claimExpenseId1, result)
        const claimExpense2Found = claimExpenseFound(claimExpenseId2, result)

        expect(claimExpense1Found).toBe(true) //eslint-disable-line
        expect(claimExpense2Found).toBe(true) //eslint-disable-line
        expect(result).toHaveLength(2)
      })
      .catch(function (error) {
        throw error
      });
  })

  it('should return the expected fields', function () {
    return getClaimExpensesForClaims(claimId)
      .then(function (result) {
        const fields = Object.keys(result[0])

        expect(fields).toContain('ClaimExpenseId')
        expect(fields).toContain('ExpenseType')
        expect(fields).toContain('ApprovedCost')
      })
      .catch(function (error) {
        throw error
      });
  })

  afterAll(function () {
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
