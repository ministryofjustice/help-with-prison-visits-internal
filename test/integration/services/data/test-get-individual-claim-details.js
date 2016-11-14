var expect = require('chai').expect
var moment = require('moment')
var databaseHelper = require('../../../helpers/database-setup-for-tests')

var getClaim = require('../../../../app/services/data/get-individual-claim-details')
var reference = 'V123456'
var testData
var date
var claimId
var eligibilityId
var prisonerId
var visitorId
var expenseId1
var expenseId2
var childId1
var childId2

describe('services/data/get-individual-claim-details', function () {
  describe('get', function () {
    before(function () {
      testData = databaseHelper.getTestData(reference, 'Test')
      date = moment().toDate()
      return databaseHelper.insertTestData(reference, date, 'Test').then(function (ids) {
        claimId = ids.claimId
        eligibilityId = ids.eligibilityId
        prisonerId = ids.prisonerId
        visitorId = ids.visitorId
        expenseId1 = ids.expenseId1
        expenseId2 = ids.expenseId2
        childId1 = ids.childId1
        childId2 = ids.childId2
      })
    })

    it('should return a claims details', function () {
      return getClaim(claimId)
        .then(function (result) {
          expect(result.claim.Reference).to.equal(reference)
          expect(result.claim.FirstName).to.equal(testData.Visitor.FirstName)
          expect(result.claim.DateSubmitted.toString()).to.equal(date.toString())
          expect(result.claim.NationalInsuranceNumber).to.equal(testData.Visitor.NationalInsuranceNumber)
          expect(result.claim.HouseNumberAndStreet).to.equal(testData.Visitor.HouseNumberAndStreet)
          expect(result.claim.EmailAddress).to.equal(testData.Visitor.EmailAddress)
          expect(result.claim.PrisonNumber).to.equal(testData.Prisoner.PrisonNumber)
          expect(result.claim.NameOfPrison).to.equal(testData.Prisoner.NameOfPrison)
          expect(result.claimExpenses[0].ExpenseType).to.equal(testData.ClaimExpenses[0].ExpenseType)
          expect(result.claimExpenses[1].Cost).to.equal(testData.ClaimExpenses[1].Cost)
          expect(result.claimChild[0].Name).to.equal(testData.ClaimChild[0].Name)
          expect(result.claimChild[1].Name).to.equal(testData.ClaimChild[1].Name)
        })
        .catch(function (error) {
          throw error
        })
    })

    after(function () {
      return databaseHelper.deleteTestData(
        claimId,
        eligibilityId,
        visitorId,
        prisonerId,
        expenseId1,
        expenseId2,
        childId1,
        childId2
      )
    })
  })
})
