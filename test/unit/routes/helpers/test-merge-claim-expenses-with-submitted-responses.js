const expect = require('chai').expect

const mergeClaimExpensesWithSubmittedResponses = require('../../../../app/routes/helpers/merge-claim-expenses-with-submitted-responses')

describe('routes/helpers/get-claim-expense-non-persisted-details', function () {
  it('should return an array of claim expenses', function (done) {
    var oldData = [
      {
        ClaimExpenseId: 1,
        status: undefined,
        cost: '19.20'
      },
      {
        ClaimExpenseId: 2,
        status: undefined,
        cost: '20.00'
      },
      {
        ClaimExpenseId: 3,
        status: undefined,
        cost: '2.00'
      }]

    var newData = [
      {
        claimExpenseId: 1,
        status: 'APPROVED'
      },
      {
        claimExpenseId: 2,
        status: 'APPROVED-DIFF-AMOUNT',
        approvedCost: '2.10'
      },
      {
        claimExpenseId: 3,
        status: 'APPROVED-DIFF-AMOUNT',
        approvedCost: ''
      }]

    var nonPersistedExpenseData = mergeClaimExpensesWithSubmittedResponses(oldData, newData)

    expect(nonPersistedExpenseData[0].ClaimExpenseId).to.equal(1)

    expect(nonPersistedExpenseData[1].ClaimExpenseId).to.equal(2)
    expect(nonPersistedExpenseData[1].ApprovedCost).to.equal('2.10')

    expect(nonPersistedExpenseData[2].ClaimExpenseId).to.equal(3)
    expect(nonPersistedExpenseData[2].ApprovedCost).to.equal('')
    expect(nonPersistedExpenseData[2].Error).to.equal(true)

    done()
  })
})
