const expect = require('chai').expect
const mergeClaimExpensesWithSubmittedResponses = require('../../../../app/routes/helpers/merge-claim-expenses-with-submitted-responses')
const claimDecisionEnum = require('../../../../app/constants/claim-decision-enum')

var oldData
var newData

describe('routes/helpers/get-claim-expense-non-persisted-details', function () {
  before(function (done) {
    oldData = [
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

    newData = [
      {
        claimExpenseId: 1,
        status: claimDecisionEnum.APPROVED
      },
      {
        claimExpenseId: 2,
        status: claimDecisionEnum.APPROVED_DIFF_AMOUNT,
        approvedCost: '2.10'
      },
      {
        claimExpenseId: 3,
        status: claimDecisionEnum.APPROVED_DIFF_AMOUNT,
        approvedCost: ''
      }]
    done()
  })

  it('should return an array of claim expenses', function (done) {
    var nonPersistedExpenseData = mergeClaimExpensesWithSubmittedResponses(oldData, newData)
    expect(nonPersistedExpenseData[0].ClaimExpenseId).to.equal(1)
    expect(nonPersistedExpenseData[1].ClaimExpenseId).to.equal(2)
    expect(nonPersistedExpenseData[2].ClaimExpenseId).to.equal(3)
    done()
  })
  it('should set the status of each element in array', function (done) {
    var nonPersistedExpenseData = mergeClaimExpensesWithSubmittedResponses(oldData, newData)
    expect(nonPersistedExpenseData[0].Status).to.equal(newData[0].status)
    expect(nonPersistedExpenseData[1].Status).to.equal(newData[1].status)
    expect(nonPersistedExpenseData[2].Status).to.equal(newData[2].status)
    done()
  })
  it('should set the approvedCost of each element in array', function (done) {
    var nonPersistedExpenseData = mergeClaimExpensesWithSubmittedResponses(oldData, newData)
    expect(nonPersistedExpenseData[0].ApprovedCost).to.equal(newData[0].approvedCost)
    expect(nonPersistedExpenseData[1].ApprovedCost).to.equal(newData[1].approvedCost)
    expect(nonPersistedExpenseData[2].ApprovedCost).to.equal(newData[2].approvedCost)
    done()
  })

  it('should set Error in only those who have incorrect data', function (done) {
    var nonPersistedExpenseData = mergeClaimExpensesWithSubmittedResponses(oldData, newData)
    expect(nonPersistedExpenseData[0].Error).to.equal(undefined)
    expect(nonPersistedExpenseData[1].Error).to.equal(undefined)
    expect(nonPersistedExpenseData[2].Error).to.equal(true)
    done()
  })
})
