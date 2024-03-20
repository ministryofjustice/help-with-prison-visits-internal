const getFormattedClaimExpenseString = require('../../../app/services/get-formatted-claim-expense-string')

const singleClaimExpense = [
  {
    ExpenseType: 'refreshment',
    ApprovedCost: '5'
  }
]

const expenseWithNullApprovedCost = [
  {
    ExpenseType: 'accommodation',
    ApprovedCost: null
  }
]

const multipleClaimExpenses = [
  {
    ExpenseType: 'bus',
    ApprovedCost: '5'
  },
  {
    ExpenseType: 'train',
    ApprovedCost: '10'
  },
  {
    ExpenseType: 'ferry',
    ApprovedCost: '15'
  }
]

describe('services/get-formatted-claim-expense-string', function () {
  it('should return a correctly formatted string for a single expense', function () {
    const claimExpenseString = getFormattedClaimExpenseString(singleClaimExpense)

    expect(claimExpenseString).toBe('Light refreshment: 5')
  })

  it('should return a correctly formatted string for multiple expenses', function () {
    const claimExpenseString = getFormattedClaimExpenseString(multipleClaimExpenses)

    expect(claimExpenseString).toBe('Bus journey: 5|Train journey: 10|Ferry journey: 15')
  })

  it('should return 0 for claims that dont have an ApprovedCost', function () {
    const claimExpenseString = getFormattedClaimExpenseString(expenseWithNullApprovedCost)

    expect(claimExpenseString).toBe('Accommodation: 0')
  })
})
