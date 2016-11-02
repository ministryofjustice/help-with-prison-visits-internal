const ClaimExpenseResponse = require('../../../../app/services/domain/claim-expense-response')
const expect = require('chai').expect

describe('services/domain/claim-expense-response', function () {
  describe('constructor', function () {
    it('should construct a domain object given valid input', function (done) {
      var claimExpenseResponse = new ClaimExpenseResponse('1', '10', 'APPROVED')
      expect(claimExpenseResponse.claimExpenseId).to.equal('1')
      expect(claimExpenseResponse.approvedCost).to.equal('10')
      expect(claimExpenseResponse.status).to.equal('APPROVED')
      done()
    })
  })

  describe('getClaimExpenseData', function () {
    it('should return an array of ClaimExpenseResponse', function (done) {
      var data = {
        'claim-expense-1-status': 'APPROVED',
        'claim-expense-1-approvedcost': '10',
        'claim-expense-2-status': 'REJECTED',
        'claim-expense-2-approvedcost': ''
      }

      var claimExpenseResponses = ClaimExpenseResponse.getClaimExpenseData(data)

      expect(claimExpenseResponses.length).to.equal(2)

      expect(claimExpenseResponses[0].claimExpenseId).to.equal('1')
      expect(claimExpenseResponses[0].approvedCost).to.equal(data['claim-expense-1-approvedcost'])
      expect(claimExpenseResponses[0].status).to.equal(data['claim-expense-1-status'])

      expect(claimExpenseResponses[1].claimExpenseId).to.equal('2')
      expect(claimExpenseResponses[1].approvedCost).to.equal(data['claim-expense-2-approvedcost'])
      expect(claimExpenseResponses[1].status).to.equal(data['claim-expense-2-status'])

      done()
    })
  })
})
