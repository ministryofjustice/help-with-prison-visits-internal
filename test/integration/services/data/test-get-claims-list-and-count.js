var expect = require('chai').expect
var moment = require('moment')
var databaseHelper = require('../../../helpers/database-setup-for-tests')

var getClaimsListAndCount = require('../../../../app/services/data/get-claim-list-and-count')
var testData
var reference = 'V123456'
var date
var claimId
var eligibilityId
var prisonerId
var visitorId
var expenseId1
var expenseId2

describe('services/data/get-claim-list-and-count', function () {
  describe('module', function (done) {
    before(function (done) {
      date = moment()
      testData = databaseHelper.getTestData(reference, 'TESTING')
      databaseHelper.insertTestData(reference, date.toDate(), 'TESTING').then(function (ids) {
        claimId = ids.claimId
        eligibilityId = ids.eligibilityId
        prisonerId = ids.prisonerId
        visitorId = ids.visitorId
        expenseId1 = ids.expenseId1
        expenseId2 = ids.expenseId2
        done()
      })
    })

    it('should return list of claims and total', function (done) {
      getClaimsListAndCount('TESTING', 0, 1)
        .then(function (result) {
          expect(result.claims.length).to.equal(1)
          expect(result.claims[0].Reference).to.equal(reference)
          expect(result.claims[0].FirstName).to.equal(testData.Visitor.FirstName)
          expect(result.claims[0].LastName).to.equal(testData.Visitor.LastName)
          expect(result.claims[0].Name).to.be.equal(`${testData.Visitor.FirstName} ${testData.LastName}`)
          expect(result.claims[0].DateSubmittedFormatted.toString()).to.equal(date.format('DD-MM-YYYY HH:MM').toString())
          expect(result.claims[0].ClaimId).to.equal(claimId)
          expect(result.total.Count).to.equal(1)
          done()
        })
        .catch(function (error) {
          throw error
        })
    })

    it('should return no data', function (done) {
      getClaimsListAndCount('TESTING_NONE', 0, 10)
        .then(function (result) {
          expect(result.total.Count).to.equal(0)
          done()
        })
        .catch(function (error) {
          throw error
        })
    })

    after(function (done) {
      // Clean up
      databaseHelper.deleteTestData(claimId, eligibilityId, visitorId, prisonerId, expenseId1, expenseId2).then(function () {
        done()
      })
    })
  })
})
