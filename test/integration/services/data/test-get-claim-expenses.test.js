const dateFormatter = require('../../../../app/services/date-formatter')
const { insertTestData, deleteAll } = require('../../../helpers/database-setup-for-tests')

const getClaimExpensesForClaims = require('../../../../app/services/data/get-claim-expenses-for-claims')
const reference = 'GETEXP'
let claimId
let claimExpenseId1
let claimExpenseId2

describe('services/data/get-claim-expenses', () => {
  beforeAll(() => {
    return insertTestData(reference, dateFormatter.now().toDate(), 'TESTING')
      .then(function (ids) {
        claimId = [ids.claimId]
        claimExpenseId1 = ids.expenseId1
        claimExpenseId2 = ids.expenseId2
      })
  })

  it('should return the expected claim expenses', () => {
    return getClaimExpensesForClaims(claimId)
      .then(result => {
        const claimExpense1Found = claimExpenseFound(claimExpenseId1, result)
        const claimExpense2Found = claimExpenseFound(claimExpenseId2, result)

        expect(claimExpense1Found).toBe(true)
        expect(claimExpense2Found).toBe(true)
        expect(result).toHaveLength(2)
      })
      .catch(error => {
        throw error
      })
  })

  it('should return the expected fields', () => {
    return getClaimExpensesForClaims(claimId)
      .then(result => {
        const fields = Object.keys(result[0])

        expect(fields).toContain('ClaimExpenseId')
        expect(fields).toContain('ExpenseType')
        expect(fields).toContain('ApprovedCost')
      })
      .catch(error => {
        throw error
      })
  })

  afterAll(() => {
    return deleteAll(reference)
  })
})

function claimExpenseFound (claimExpenseId, claimExpenses) {
  let result = false

  claimExpenses.forEach(claimExpense => {
    if (claimExpense.ClaimExpenseId === claimExpenseId) {
      result = true
    }
  })

  return result
}
