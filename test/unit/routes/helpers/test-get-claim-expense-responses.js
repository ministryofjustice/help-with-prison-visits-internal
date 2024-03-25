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

    expect(claimExpenseResponses.length).toBe(2)

    expect(claimExpenseResponses[0].claimExpenseId).toBe('1')
    expect(claimExpenseResponses[0].approvedCost).toBe(data['claim-expense-1-approvedcost'])
    expect(claimExpenseResponses[0].approvedCost).toBe(data['claim-expense-1-cost'])
    expect(claimExpenseResponses[0].status).toBe(data['claim-expense-1-status'])

    expect(claimExpenseResponses[1].claimExpenseId).toBe('2')
    expect(claimExpenseResponses[1].approvedCost).toBe(data['claim-expense-2-approvedcost'])
    expect(claimExpenseResponses[1].approvedCost).toBe(data['claim-expense-2-cost'])
    expect(claimExpenseResponses[1].status).toBe(data['claim-expense-2-status'])

    done()
  })
})
