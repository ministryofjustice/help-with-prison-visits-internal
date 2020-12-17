const ClaimExpenseResponse = require('../../../../app/services/domain/claim-expense-response')
const expect = require('chai').expect

describe('services/domain/claim-expense-response', function () {
  it('should construct a domain object given valid input', function (done) {
    const claimExpenseResponse = new ClaimExpenseResponse('1', '10', '10', 'APPROVED')
    expect(claimExpenseResponse.claimExpenseId).to.equal('1')
    expect(claimExpenseResponse.approvedCost).to.equal('10')
    expect(claimExpenseResponse.cost).to.equal('10')
    expect(claimExpenseResponse.status).to.equal('APPROVED')
    done()
  })
})
