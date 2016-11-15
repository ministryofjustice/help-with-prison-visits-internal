var config = require('../../knexfile').migrations
var knex = require('knex')(config)
var Promise = require('bluebird')

// TODO extract sample data into separate object so you can retrieve it and use in tests, so if it is updated it won't break tests
module.exports.insertTestData = function (reference, date, status) {
  var data = this.getTestData(reference, status)
  return new Promise(function (resolve, reject) {
    // Generate unique Integer for Ids using timestamp in tenth of seconds
    var uniqueId = Math.floor(Date.now() / 100) - 14000000000
    var uniqueId2 = uniqueId + 1

    var ids = {}
    knex('IntSchema.Eligibility')
      .insert({
        EligibilityId: uniqueId,
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
            PrisonerId: uniqueId,
            EligibilityId: ids.eligibilityId,
            Reference: reference,
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
            VisitorId: uniqueId,
            EligibilityId: ids.eligibilityId,
            Reference: reference,
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
            ClaimId: uniqueId,
            EligibilityId: ids.eligibilityId,
            Reference: reference,
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
            ClaimExpenseId: uniqueId,
            EligibilityId: ids.eligibilityId,
            Reference: reference,
            ClaimId: ids.claimId,
            ExpenseType: data.ClaimExpenses[0].ExpenseType,
            Cost: data.ClaimExpenses[0].Cost,
            From: data.ClaimExpenses[0].From,
            To: data.ClaimExpenses[0].To,
            IsReturn: data.ClaimExpenses[0].IsReturn,
            IsEnabled: true
          })
      })
      .then(function (result) {
        ids.expenseId1 = result[0]
        return knex('IntSchema.ClaimExpense')
          .returning('ClaimExpenseId')
          .insert({
            ClaimExpenseId: uniqueId2,
            EligibilityId: ids.eligibilityId,
            Reference: reference,
            ClaimId: ids.claimId,
            ExpenseType: data.ClaimExpenses[1].ExpenseType,
            Cost: data.ClaimExpenses[1].Cost,
            DurationOfTravel: data.ClaimExpenses[1].DurationOfTravel,
            IsEnabled: true
          })
      })
      .then(function (result) {
        ids.expenseId2 = result[0]
        return knex('IntSchema.ClaimChild')
          .returning('ClaimChildId')
          .insert({
            ClaimChildId: uniqueId,
            EligibilityId: ids.eligibilityId,
            Reference: reference,
            ClaimId: ids.claimId,
            Name: data.ClaimChild[0].Name,
            DateOfBirth: date,
            Relationship: data.ClaimChild[0].Relationship,
            IsEnabled: true
          })
      })
      .then(function (result) {
        ids.childId1 = result[0]
        return knex('IntSchema.ClaimChild')
          .returning('ClaimChildId')
          .insert({
            ClaimChildId: uniqueId2,
            EligibilityId: ids.eligibilityId,
            Reference: reference,
            ClaimId: ids.claimId,
            Name: data.ClaimChild[1].Name,
            DateOfBirth: date,
            Relationship: data.ClaimChild[1].Relationship,
            IsEnabled: true
          })
      })
      .then(function (result) {
        ids.childId2 = result[0]
        return knex('IntSchema.ClaimDocument')
          .returning('ClaimDocumentId')
          .insert({
            ClaimDocumentId: uniqueId,
            ClaimId: ids.claimId,
            EligibilityId: ids.eligibilityId,
            Reference: reference,
            DocumentType: data.ClaimDocument.DocumentType,
            DocumentStatus: data.ClaimDocument.DocumentStatus,
            DateSubmitted: date,
            IsEnabled: data.ClaimDocument.IsEnabled
          })
      })
      .then(function (result) {
        ids.claimDocumentId = result[0]
        resolve(ids)
      })
      .catch(function (error) {
        reject(error)
      })
  })
}

function deleteByReference (schemaTable, reference) {
  return knex(schemaTable).where('Reference', reference).del()
}

module.exports.deleteAll = function (reference) {
  return deleteByReference('IntSchema.Task', reference)
    .then(function () { return deleteByReference('IntSchema.ClaimBankDetail', reference) })
    .then(function () { return deleteByReference('IntSchema.ClaimDocument', reference) })
    .then(function () { return deleteByReference('IntSchema.ClaimExpense', reference) })
    .then(function () { return deleteByReference('IntSchema.ClaimChild', reference) })
    .then(function () { return deleteByReference('IntSchema.Claim', reference) })
    .then(function () { return deleteByReference('IntSchema.Visitor', reference) })
    .then(function () { return deleteByReference('IntSchema.Prisoner', reference) })
    .then(function () { return deleteByReference('IntSchema.Eligibility', reference) })
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
    }],
    ClaimChild: [{
      Name: 'Jane Bloggs',
      DateOfBirth: '01-09-2005',
      Relationship: 'prisoners-child'
    },
    {
      Name: 'Michael Bloggs',
      DateOfBirth: '15-10-2010',
      Relationship: 'claimants-child'
    }],
    ClaimDocument: {
      DocumentType: 'VISIT-CONFIRMATION',
      DocumentStatus: 'uploaded',
      IsEnabled: 'true'
    }
  }
}
