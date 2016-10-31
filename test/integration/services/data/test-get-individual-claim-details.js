var expect = require('chai').expect
var moment = require('moment')
var databaseHelper = require('../../../helpers/database-setup-for-tests')

var getClaim = require('../../../../app/services/data/get-individual-claim-details')
var reference = 'V123456'
var date
var claimId
var eligibilityId
var prisonerId
var visitorId
var expenseId1
var expenseId2

describe('services/data/get-individual-claim-details', function () {
  describe('get', function (done) {
    before(function (done) {
      date = moment().toDate()
      databaseHelper.setup(reference, date, 'Test').then(function (ids) {
        claimId = ids.claimId
        eligibilityId = ids.eligibilityId
        prisonerId = ids.prisonerId
        visitorId = ids.visitorId
        expenseId1 = ids.expenseId1
        expenseId2 = ids.expenseId2
        done()
      })
    })

    it('should return a claims details', function (done) {
      getClaim(claimId)
        .then(function (result) {
          expect(result.claim.Reference).to.equal(reference)
          expect(result.claim.FirstName).to.equal('John')
          expect(result.claim.DateSubmitted.toString()).to.equal(date.toString())
          expect(result.claim.NationalInsuranceNumber).to.equal('QQ123456c')
          expect(result.claim.HouseNumberAndStreet).to.equal('1 Test Road')
          expect(result.claim.EmailAddress).to.equal('test@test.com')
          expect(result.claim.PrisonNumber).to.equal('A123456')
          expect(result.claim.NameOfPrison).to.equal('Test')
          expect(result.claimExpenses[0].ExpenseType).to.equal('train')
          expect(result.claimExpenses[1].Cost).to.equal(80)
          done()
        })
        .catch(function (error) {
          throw error
        })
    })

    after(function (done) {
      // Clean up
      databaseHelper.delete(claimId, eligibilityId, visitorId, prisonerId, expenseId1, expenseId2).then(function () {
        done()
      })
    })
  })
})
