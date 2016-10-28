var expect = require('chai').expect
var moment = require('moment')
var databaseHelper = require('../../../helpers/database-setup-for-tests')

var claim = require('../../../../app/services/data/get-individual-claim-details')
var reference = 'V123456'
var date
var claimId
var eligibilityId
var prisonerId
var visitorId

describe('services/data/get-individual-claim-details', function () {
  describe('get', function (done) {
    before(function (done) {
      date = moment().toDate()
      databaseHelper.setup(reference, date, 'TEST').then(function (ids) {
        claimId = ids.claimId
        eligibilityId = ids.eligibilityId
        prisonerId = ids.prisonerId
        visitorId = ids.visitorId
        done()
      })
    })

    it('should return a claims details', function (done) {
      claim.get(claimId)
        .then(function (result) {
          expect(result.Reference).to.equal(reference)
          expect(result.FirstName).to.equal('John')
          expect(result.LastName).to.equal('Smith')
          expect(result.DateSubmitted.toString()).to.equal(date.toString())
          expect(result.DateOfBirth.toString()).to.equal(date.toString())
          expect(result.NationalInsuranceNumber).to.equal('QQ123456c')
          expect(result.HouseNumberAndStreet).to.equal('1 Test Road')
          expect(result.Town).to.equal('1 Test Road')
          expect(result.County).to.equal('Durham')
          expect(result.EmailAddress).to.equal('test@test.com')
          expect(result.PhoneNumber).to.equal('07911111111')
          expect(result.PrisonerFirstName).to.equal('TestFirst')
          expect(result.PrisonerLastName).to.equal('TestLast')
          expect(result.PrisonerDateOfBirth.toString()).to.equal(date.toString())
          expect(result.PrisonNumber).to.equal('A123456')
          expect(result.NameOfPrison).to.equal('Test')
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
