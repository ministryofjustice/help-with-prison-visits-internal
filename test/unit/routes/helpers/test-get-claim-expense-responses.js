const expect = require('chai').expect

const getClaimExpenseResponses = require('../../../../app/routes/helpers/get-claim-expense-responses')

describe('routes/helpers/get-claim-expense-responses', function () {
  it('should return an array of ClaimExpenseResponse', function (done) {
    const data = {
      'claim-expense-1-status': 'APPROVED',
      'claim-expense-1-approvedcost': '10',
      'claim-expense-1-cost': '10',
      'claim-expense-2-status': 'REJECTED',
      'claim-expense-2-approvedcost': '',
      'claim-expense-2-cost': ''
    }

    const claimExpenseResponses = getClaimExpenseResponses(data)

    expect(claimExpenseResponses.length).to.equal(2)

    expect(claimExpenseResponses[0].claimExpenseId).to.equal('1')
    expect(claimExpenseResponses[0].approvedCost).to.equal(data['claim-expense-1-approvedcost'])
    expect(claimExpenseResponses[0].approvedCost).to.equal(data['claim-expense-1-cost'])
    expect(claimExpenseResponses[0].status).to.equal(data['claim-expense-1-status'])

    expect(claimExpenseResponses[1].claimExpenseId).to.equal('2')
    expect(claimExpenseResponses[1].approvedCost).to.equal(data['claim-expense-2-approvedcost'])
    expect(claimExpenseResponses[1].approvedCost).to.equal(data['claim-expense-2-cost'])
    expect(claimExpenseResponses[1].status).to.equal(data['claim-expense-2-status'])

    done()
  })
})
