const expect = require('chai').expect
const getClaimTotalAmount = require('../../../app/services/get-claim-total-amount')

const claimExpenses = [
  {
    Cost: 5
  },
  {
    Cost: 10
  },
  {
    Cost: 15
  }
]

const claimDeductions = [
  {
    Amount: 5
  },
  {
    Amount: 5
  }
]

describe('services/get-claim-total-amount', function () {
  it('should calculate the total value from claim expenses and deductions', function () {
    var total = getClaimTotalAmount(claimExpenses, claimDeductions)

    expect(total).to.equal('20.00')
  })

  it('should calculate the correct total value from claim expenses only', function () {
    var total = getClaimTotalAmount(claimExpenses, [])

    expect(total).to.equal('30.00')
  })
})
