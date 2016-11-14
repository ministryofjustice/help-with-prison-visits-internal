var expect = require('chai').expect
var moment = require('moment')
var databaseHelper = require('../../../helpers/database-setup-for-tests')

var getClaimsListAndCount = require('../../../../app/services/data/get-claim-list-and-count')
var testData
var reference = 'V123456'
var date
var claimId

describe('services/data/get-claim-list-and-count', function () {
  describe('module', function () {
    before(function () {
      date = moment()
      testData = databaseHelper.getTestData(reference, 'TESTING')
      return databaseHelper.insertTestData(reference, date.toDate(), 'TESTING').then(function (ids) {
        claimId = ids.claimId
      })
    })

    it('should return list of claims and total', function () {
      return getClaimsListAndCount('TESTING', 0, 1)
        .then(function (result) {
          expect(result.claims.length).to.equal(1)
          expect(result.claims[0].Reference).to.equal(reference)
          expect(result.claims[0].FirstName).to.equal(testData.Visitor.FirstName)
          expect(result.claims[0].LastName).to.equal(testData.Visitor.LastName)
          expect(result.claims[0].Name).to.be.equal(`${testData.Visitor.FirstName} ${testData.Visitor.LastName}`)
          expect(result.claims[0].DateSubmittedFormatted.toString()).to.equal(date.format('DD-MM-YYYY HH:mm').toString())
          expect(result.claims[0].ClaimId).to.equal(claimId)
          expect(result.total.Count).to.equal(1)
        })
        .catch(function (error) {
          throw error
        })
    })

    it('should return no data', function () {
      return getClaimsListAndCount('TESTING_NONE', 0, 10)
        .then(function (result) {
          expect(result.total.Count).to.equal(0)
        })
        .catch(function (error) {
          throw error
        })
    })

    after(function () {
      return databaseHelper.deleteAll(reference)
    })
  })
})
