var expect = require('chai').expect
var config = require('../../../../knexfile').migrations
var knex = require('knex')(config)
var moment = require('moment')

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
      knex('IntSchema.Eligibility')
        .insert({
          Reference: reference,
          DateCreated: DATE,
          DateSubmitted: DATE,
          Status: 'TEST'
        })
        .returning('EligibilityId')
        .then(function (result) {
          eligibilityId = result[0]
          return knex('IntSchema.Prisoner')
            .returning('PrisonerId')
            .insert({
              EligibilityId: eligibilityId,
              FirstName: 'TestFirst',
              LastName: 'TestLast',
              DateOfBirth: DATE,
              PrisonNumber: 'A123456',
              NameOfPrison: 'Test'
            })
            .then(function (result) {
              prisonerId = result[0]
              return prisonerId
            })
        }).then(function () {
          return knex('IntSchema.Visitor')
          .returning('VisitorId')
          .insert({
            EligibilityId: eligibilityId,
            Title: 'Mr',
            FirstName: 'John',
            LastName: 'Smith',
            NationalInsuranceNumber: 'QQ123456c',
            HouseNumberAndStreet: '1 Test Road',
            Town: '1 Test Road',
            County: 'Durham',
            PostCode: 'bT111BT',
            Country: 'England',
            EmailAddress: 'test@test.com',
            PhoneNumber: '07911111111',
            DateOfBirth: DATE,
            Relationship: 'partner',
            JourneyAssistance: 'no',
            RequireBenefitUpload: 0
          })
          .then(function (result) {
            visitorId = result[0]
            return prisonerId
          })
        }).then(function () {
          return knex('IntSchema.Claim')
          .returning('ClaimId')
          .insert({
            EligibilityId: eligibilityId,
            DateOfJourney: DATE,
            DateCreated: DATE,
            DateSubmitted: DATE,
            Status: 'TEST'
          })
        }).then(function (result) {
          claimId = result[0]
          done()
        })
    })

    it('should get 5 columns from 3 tables', function (done) {
      claims.get('TEST')
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

    after(function (done) {
      console.log('after')
      // Clean up
      knex('IntSchema.Claim').where('ClaimId', claimId).del().then(function () {
        knex('IntSchema.Visitor').where('VisitorId', visitorId).del().then(function () {
          knex('IntSchema.Prisoner').where('PrisonerId', prisonerId).del().then(function () {
            knex('IntSchema.Eligibility').where('EligibilityId', eligibilityId).del().then(function () {
              done()
            })
          })
        })
      })
      done()
    })
  })
})
