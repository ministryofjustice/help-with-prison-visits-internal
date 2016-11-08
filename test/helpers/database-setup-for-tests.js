var config = require('../../knexfile').migrations
var knex = require('knex')(config)
var Promise = require('bluebird')

// TODO extract sample data into separate object so you can retrieve it and use in tests, so if it is updated it won't break tests
module.exports.insertTestData = function (reference, date, status) {
  var data = this.getTestData(reference, status)
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
            FirstName: data.Prisoner.FirstName,
            LastName: data.Prisoner.LastName,
            DateOfBirth: date,
            PrisonNumber: data.Prisoner.PrisonNumber,
            NameOfPrison: data.Prisoner.NameOfPrison
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
            Title: data.Visitor.Title,
            FirstName: data.Visitor.FirstName,
            LastName: data.Visitor.LastName,
            NationalInsuranceNumber: data.Visitor.NationalInsuranceNumber,
            HouseNumberAndStreet: data.Visitor.HouseNumberAndStreet,
            Town: data.Visitor.Town,
            County: data.Visitor.County,
            PostCode: data.Visitor.PostCode,
            Country: data.Visitor.Country,
            EmailAddress: data.Visitor.EmailAddress,
            PhoneNumber: data.Visitor.PhoneNumber,
            DateOfBirth: date,
            Relationship: data.Visitor.Relationship
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
            ExpenseType: data.ClaimExpenses[0].ExpenseType,
            Cost: data.ClaimExpenses[0].Cost,
            From: data.ClaimExpenses[0].From,
            To: data.ClaimExpenses[0].To,
            IsReturn: data.ClaimExpenses[0].IsReturn
          })
      })
      .then(function (result) {
        ids.expenseId1 = result[0]
        return knex('IntSchema.ClaimExpense')
          .returning('ClaimExpenseId')
          .insert({
            ClaimId: ids.claimId,
            ExpenseType: data.ClaimExpenses[1].ExpenseType,
            Cost: data.ClaimExpenses[1].Cost,
            DurationOfTravel: data.ClaimExpenses[1].DurationOfTravel
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

module.exports.getTestData = function (reference, status) {
  return {
    Prisoner: { FirstName: 'TestFirst',
      LastName: 'TestLast',
      PrisonNumber: 'A123456',
      NameOfPrison: 'Test'
    },
    Visitor: {
      Title: 'Mr',
      FirstName: 'John',
      LastName: 'Smith',
      NationalInsuranceNumber: 'QQ123456C',
      HouseNumberAndStreet: '1 Test Road',
      Town: 'Town',
      County: 'Durham',
      PostCode: 'BT111BT',
      Country: 'England',
      EmailAddress: 'donotsend@apvs.com',
      PhoneNumber: '07911111111',
      Relationship: 'partner'
    },
    ClaimExpenses: [{
      ExpenseType: 'train',
      Cost: '12.50',
      From: 'London',
      To: 'Hewell',
      IsReturn: true
    },
    {
      ExpenseType: 'accommodation',
      Cost: '80.00',
      DurationOfTravel: 1
    }]
  }
}
