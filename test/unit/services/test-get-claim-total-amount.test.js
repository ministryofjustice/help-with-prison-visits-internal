const getClaimTotalAmount = require('../../../app/services/get-claim-total-amount')

const claimExpenses = [
  {
    Cost: '5',
  },
  {
    Cost: '10',
  },
  {
    Cost: '15',
  },
]

const claimExpensesApprovedCost = [
  {
    Cost: '5',
    ApprovedCost: 3.49,
  },
  {
    Cost: '10',
    ApprovedCost: null,
  },
  {
    Cost: '10.50',
  },
]

const claimDeductions = [
  {
    Amount: 5,
  },
  {
    Amount: 5,
  },
]

describe('services/get-claim-total-amount', () => {
  it('should calculate the total value from claim expenses and deductions', () => {
    const total = getClaimTotalAmount(claimExpenses, claimDeductions)

    expect(total).toBe('20.00')
  })

  it('should calculate the correct total value from claim expenses only', () => {
    const total = getClaimTotalAmount(claimExpenses, [])

    expect(total).toBe('30.00')
  })

  it('should calculate the correct total value when approved cost is different from initial cost', () => {
    const total = getClaimTotalAmount(claimExpensesApprovedCost, [])

    expect(total).toBe('23.99')
  })
})
