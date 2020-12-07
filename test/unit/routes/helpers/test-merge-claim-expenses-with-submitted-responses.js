const expect = require('chai').expect
const mergeClaimExpensesWithSubmittedResponses = require('../../../../app/routes/helpers/merge-claim-expenses-with-submitted-responses')
const claimDecisionEnum = require('../../../../app/constants/claim-decision-enum')

let oldData
let newData

describe('routes/helpers/merge-claim-expenses-with-submitted-responses', function () {
  before(function () {
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
  })

  it('should return an array of claim expenses', function () {
    const mergedData = mergeClaimExpensesWithSubmittedResponses(oldData, newData)
    expect(mergedData[0].ClaimExpenseId).to.equal(1)
    expect(mergedData[1].ClaimExpenseId).to.equal(2)
    expect(mergedData[2].ClaimExpenseId).to.equal(3)
  })
  it('should set the status of each element in array', function () {
    const mergedData = mergeClaimExpensesWithSubmittedResponses(oldData, newData)
    expect(mergedData[0].Status).to.equal(newData[0].status)
    expect(mergedData[1].Status).to.equal(newData[1].status)
    expect(mergedData[2].Status).to.equal(newData[2].status)
  })
  it('should set the approvedCost of each element in array', function () {
    const mergedData = mergeClaimExpensesWithSubmittedResponses(oldData, newData)
    expect(mergedData[0].ApprovedCost).to.equal(newData[0].approvedCost)
    expect(mergedData[1].ApprovedCost).to.equal(newData[1].approvedCost)
    expect(mergedData[2].ApprovedCost).to.equal(newData[2].approvedCost)
  })

  it('should set Error in only those who have incorrect data', function () {
    const mergedData = mergeClaimExpensesWithSubmittedResponses(oldData, newData)
    expect(mergedData[0].Error).to.equal(undefined)
    expect(mergedData[1].Error).to.equal(undefined)
    expect(mergedData[2].Error).to.equal(true)
  })

  it('should return the old data if no new data exists', function () {
    const mergedData = mergeClaimExpensesWithSubmittedResponses(oldData, null)
    expect(mergedData).to.equal(oldData)
  })
})
