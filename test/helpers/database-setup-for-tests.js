var config = require('../../knexfile').migrations
var knex = require('knex')(config)
var Promise = require('bluebird')

// TODO extract sample data into separate object so you can retrieve it and use in tests, so if it is updated it won't break tests
module.exports.insertTestData = function (reference, date, status) {
  return new Promise(function (resolve, reject) {
    var ids = {}
    knex('IntSchema.Eligibility')
      .insert({
        Reference: reference,
        DateCreated: date,
        DateSubmitted: date,
        Status: status
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
            DateOfBirth: date,
            PrisonNumber: 'A123456',
            NameOfPrison: 'Test'
          })
          .then(function (result) {
            ids.prisonerId = result[0]
            return ids.prisonerId
          })
      })
      .then(function () {
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
            DateOfBirth: date,
            Relationship: 'partner',
            JourneyAssistance: 'no',
            RequireBenefitUpload: 0
          })
          .then(function (result) {
            ids.visitorId = result[0]
            return ids.visitorId
          })
      })
      .then(function () {
        return knex('IntSchema.Claim')
          .returning('ClaimId')
          .insert({
            EligibilityId: ids.eligibilityId,
            DateOfJourney: date,
            DateCreated: date,
            DateSubmitted: date,
            Status: status
          })
      })
      .then(function (result) {
        ids.claimId = result[0]
      })
      .then(function () {
        return knex('IntSchema.ClaimExpense')
          .returning('ClaimExpenseId')
          .insert({
            ClaimId: ids.claimId,
            ExpenseType: 'train',
            Cost: 12.50,
            From: 'London',
            To: 'Hewell',
            IsReturn: true
          })
      })
      .then(function (result) {
        ids.expenseId1 = result[0]
        return knex('IntSchema.ClaimExpense')
          .returning('ClaimExpenseId')
          .insert({
            ClaimId: ids.claimId,
            ExpenseType: 'accommodation',
            Cost: 80,
            DurationOfTravel: 1
          })
      })
      .then(function (result) {
        ids.expenseId2 = result[0]
        resolve(ids)
      })
      .catch(function (error) {
        reject(error)
      })
  })
}

module.exports.deleteTestData = function (claimId, eligibilityId, visitorId, prisonerId, expenseId1, expenseId2) {
  return new Promise(function (resolve, reject) {
    knex('IntSchema.ClaimExpense').where('ClaimExpenseId', expenseId1).del().then(function () {
      knex('IntSchema.ClaimExpense').where('ClaimExpenseId', expenseId2).del().then(function () {
        knex('IntSchema.Claim').where('ClaimId', claimId).del().then(function () {
          knex('IntSchema.Visitor').where('VisitorId', visitorId).del().then(function () {
            knex('IntSchema.Prisoner').where('PrisonerId', prisonerId).del().then(function () {
              knex('IntSchema.Eligibility').where('EligibilityId', eligibilityId).del().then(function () {
                resolve()
              })
            })
          })
        })
      })
    })
      .catch(function (error) {
        reject(error)
      })
  })
}
