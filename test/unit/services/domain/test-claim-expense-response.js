const ClaimExpenseResponse = require('../../../../app/services/domain/claim-expense-response')

describe('services/domain/claim-expense-response', function () {
  it('should construct a domain object given valid input', function (done) {
    const claimExpenseResponse = new ClaimExpenseResponse('1', '10', '10', 'APPROVED')
    expect(claimExpenseResponse.claimExpenseId).toBe('1')
    expect(claimExpenseResponse.approvedCost).toBe('10')
    expect(claimExpenseResponse.cost).toBe('10')
    expect(claimExpenseResponse.status).toBe('APPROVED')
    done()
  })
})
