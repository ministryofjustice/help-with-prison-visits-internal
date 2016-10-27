var expect = require('chai').expect
var moment = require('moment')
var databaseHelper = require('../../../helpers/database-setup-for-tests')

var claims = require('../../../../app/services/data/get-claims-by-status')
var reference = 'V123456'
var DATE
var claimId
var eligibilityId
var prisonerId
var visitorId

describe('services/data/get-claims-by-status', function () {
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

    it('should run get and return 1 row with 5 columns from 3 tables', function (done) {
      claims.get('TEST', 0, 1)
        .then(function (result) {
          expect(result.length).to.equal(1)
          expect(result[0].Reference).to.equal(reference)
          expect(result[0].FirstName).to.equal('John')
          expect(result[0].LastName).to.equal('Smith')
          expect(result[0].DateSubmitted.toString()).to.equal(DATE.toString())
          expect(result[0].ClaimId).to.equal(claimId)
          done()
        })
        .catch(function (error) {
          throw error
        })
    })

    it('should run get and return 0 rows', function (done) {
      claims.get('TEST', 0, 0)
        .then(function (result) {
          expect(result.length).to.equal(0)
          done()
        })
        .catch(function (error) {
          throw error
        })
    })

    it('should run count and return 1', function (done) {
      claims.count('TEST')
        .then(function (result) {
          expect(result.Count).to.equal(1)
          done()
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
