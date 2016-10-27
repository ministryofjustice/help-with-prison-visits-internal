var expect = require('chai').expect
var moment = require('moment')
var databaseHelper = require('../../../helpers/database-setup-for-tests')

var claims = require('../../../../app/services/data/get-claim-list-and-count')
var reference = 'V123456'
var DATE
var claimId
var eligibilityId
var prisonerId
var visitorId

describe('services/data/get-claim-list-and-count', function () {
  describe('get', function (done) {
    before(function (done) {
      DATE = moment().toDate()
      databaseHelper.setup(reference, DATE, 'TEST').then(function (ids) {
        claimId = ids.claimId
        eligibilityId = ids.eligibilityId
        prisonerId = ids.prisonerId
        visitorId = ids.visitorId
        done()
      })
    })

    it('should run getting array of claims and total', function (done) {
      claims.getClaimsListAndCount('TEST', 0, 1)
        .then(function (result) {
          expect(result.claims.length).to.equal(1)
          expect(result.claims[0].Reference).to.equal(reference)
          expect(result.claims[0].FirstName).to.equal('John')
          expect(result.claims[0].LastName).to.equal('Smith')
          expect(result.claims[0].DateSubmitted.toString()).to.equal(DATE.toString())
          expect(result.claims[0].ClaimId).to.equal(claimId)
          // expect(result.total.Count).to.equal(1)
          done()
        })
        .catch(function (error) {
          throw error
        })
    })

    it('should run get and get no data', function (done) {
      claims.getClaimsListAndCount('TESTING', 0, 10)
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
      databaseHelper.delete(claimId, eligibilityId, visitorId, prisonerId).then(function () {
        done()
      })
    })
  })
})
