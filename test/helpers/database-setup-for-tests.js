var config = require('../../knexfile').migrations
var knex = require('knex')(config)
var Promise = require('bluebird')

module.exports.setup = function (reference, DATE) {
  return new Promise(function (resolve, reject) {
    var ids = {}
    knex('IntSchema.Eligibility')
      .insert({
        Reference: reference,
        DateCreated: DATE,
        DateSubmitted: DATE,
        Status: 'TEST'
      })
      .returning('EligibilityId')
      .then(function (result) {
        ids.eligibilityId = result[0]
        return knex('IntSchema.Prisoner')
          .returning('PrisonerId')
          .insert({
            EligibilityId: ids.eligibilityId,
            FirstName: 'TestFirst',
            LastName: 'TestLast',
            DateOfBirth: DATE,
            PrisonNumber: 'A123456',
            NameOfPrison: 'Test'
          })
          .then(function (result) {
            ids.prisonerId = result[0]
            return ids.prisonerId
          })
      }).then(function () {
        return knex('IntSchema.Visitor')
        .returning('VisitorId')
        .insert({
          EligibilityId: ids.eligibilityId,
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
          ids.visitorId = result[0]
          return ids.visitorId
        })
      }).then(function () {
        return knex('IntSchema.Claim')
        .returning('ClaimId')
        .insert({
          EligibilityId: ids.eligibilityId,
          DateOfJourney: DATE,
          DateCreated: DATE,
          DateSubmitted: DATE,
          Status: 'TEST'
        })
      }).then(function (result) {
        ids.claimId = result[0]
        resolve(ids)
      })
      .catch(function (error) {
        reject(error)
      })
  })
}

module.exports.delete = function (claimId, eligibilityId, visitorId, prisonerId) {
  return new Promise(function (resolve, reject) {
    knex('IntSchema.Claim').where('ClaimId', claimId).del().then(function () {
      knex('IntSchema.Visitor').where('VisitorId', visitorId).del().then(function () {
        knex('IntSchema.Prisoner').where('PrisonerId', prisonerId).del().then(function () {
          knex('IntSchema.Eligibility').where('EligibilityId', eligibilityId).del().then(function () {
            resolve()
          })
        })
      })
    })
      .catch(function (error) {
        reject(error)
      })
  })
}
