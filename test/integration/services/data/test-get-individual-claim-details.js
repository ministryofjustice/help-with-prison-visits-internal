var expect = require('chai').expect
var moment = require('moment')
var databaseHelper = require('../../../helpers/database-setup-for-tests')

var claim = require('../../../../app/services/data/get-individual-claim-details')
var reference = 'V123456'
var DATE
var claimId
var eligibilityId
var prisonerId
var visitorId

describe('services/data/get-individual-claim-details', function () {
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

    it('should return a visitors details to do with claim', function (done) {
      claim.get(claimId)
        .then(function (result) {
          expect(result.Reference).to.equal(reference)
          expect(result.FirstName).to.equal('John')
          expect(result.LastName).to.equal('Smith')
          expect(result.DateSubmitted.toString()).to.equal(DATE.toString())
          expect(result.DateOfBirth.toString()).to.equal(DATE.toString())
          expect(result.NationalInsuranceNumber).to.equal('QQ123456c')
          expect(result.HouseNumberAndStreet).to.equal('1 Test Road')
          expect(result.Town).to.equal('1 Test Road')
          expect(result.County).to.equal('Durham')
          expect(result.EmailAddress).to.equal('test@test.com')
          expect(result.PhoneNumber).to.equal('07911111111')
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
