var config = require('../../knexfile').migrations
var knex = require('knex')(config)

// TODO extract sample data into separate object so you can retrieve it and use in tests, so if it is updated it won't break tests
module.exports.insertTestData = function (reference, date, status, visitDate, increment) {
  var idIncrement = increment || 0
  // Generate unique Integer for Ids using timestamp in tenth of seconds
  var uniqueId = Math.floor(Date.now() / 100) - 14000000000 + idIncrement

  return this.insertTestDataForIds(reference, date, status, visitDate, uniqueId, uniqueId + 1, uniqueId + 2, uniqueId + 3)
}

module.exports.insertTestDataForIds = function (reference, date, status, visitDate, uniqueId, uniqueId2, uniqueId3, uniqueId4) {
  var data = this.getTestData(reference, status)

  var ids = {}
  return knex('IntSchema.Eligibility')
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
          Relationship: data.Visitor.Relationship,
          Benefit: data.Visitor.Benefit,
          DWPBenefitCheckerResult: data.Visitor.DWPBenefitCheckerResult
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
          DateOfJourney: visitDate || date,
          DateCreated: date,
          DateSubmitted: date,
          ClaimType: data.Claim.ClaimType,
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
          DocumentType: data.ClaimDocument['visit-confirmation'].DocumentType,
          DocumentStatus: data.ClaimDocument['visit-confirmation'].DocumentStatus,
          DateSubmitted: date,
          IsEnabled: data.ClaimDocument['visit-confirmation'].IsEnabled
        })
    })
    .then(function (result) {
      ids.claimDocumentId1 = result[0]
      return knex('IntSchema.ClaimDocument')
        .returning('ClaimDocumentId')
        .insert({
          ClaimDocumentId: uniqueId2,
          ClaimId: ids.claimId,
          EligibilityId: ids.eligibilityId,
          Reference: reference,
          DocumentType: data.ClaimDocument['benefit'].DocumentType,
          DocumentStatus: data.ClaimDocument['benefit'].DocumentStatus,
          DateSubmitted: date,
          IsEnabled: data.ClaimDocument['benefit'].IsEnabled
        })
    })
    .then(function (result) {
      ids.claimDocumentId2 = result[0]
      return knex('IntSchema.ClaimDocument')
        .returning('ClaimDocumentId')
        .insert({
          ClaimDocumentId: uniqueId3,
          ClaimExpenseId: uniqueId,
          ClaimId: ids.claimId,
          EligibilityId: ids.eligibilityId,
          Reference: reference,
          DocumentType: data.ClaimDocument['expense'].DocumentType,
          DocumentStatus: data.ClaimDocument['expense'].DocumentStatus,
          DateSubmitted: date,
          IsEnabled: data.ClaimDocument['expense'].IsEnabled
        })
    })
    .then(function (result) {
      ids.claimDocumentId3 = result[0]
      return knex('IntSchema.ClaimDocument')
        .returning('ClaimDocumentId')
        .insert({
          ClaimDocumentId: uniqueId4,
          ClaimExpenseId: uniqueId2,
          ClaimId: ids.claimId,
          EligibilityId: ids.eligibilityId,
          Reference: reference,
          DocumentType: data.ClaimDocument['expense'].DocumentType,
          DocumentStatus: data.ClaimDocument['expense'].DocumentStatus,
          DateSubmitted: date,
          IsEnabled: data.ClaimDocument['expense'].IsEnabled
        })
    })
    .then(function (result) {
      ids.claimDocumentId4 = result[0]
      return knex('IntSchema.ClaimEvent')
        .returning('ClaimEventId')
        .insert({
          EligibilityId: ids.eligibilityId,
          Reference: reference,
          ClaimId: uniqueId,
          DateAdded: date,
          Event: 'An event',
          AdditionalData: 'Additional stuff',
          Note: 'A note',
          Caseworker: 'Joe Bloggs',
          IsInternal: true
        })
    })
    .then(function (result) {
      ids.claimEventId1 = result[0]
      return knex('IntSchema.ClaimEvent')
        .returning('ClaimEventId')
        .insert({
          EligibilityId: ids.eligibilityId,
          Reference: reference,
          ClaimId: uniqueId,
          DateAdded: date,
          Event: 'Another event',
          AdditionalData: 'More additional stuff',
          Note: 'Another note',
          Caseworker: 'Jane Bloggs',
          IsInternal: false
        })
    })
    .then(function (result) {
      ids.claimEventId2 = result[0]
      return ids
    })
}

function deleteByReference (schemaTable, reference) {
  return knex(schemaTable).where('Reference', reference).del()
}

module.exports.deleteAll = function (reference) {
  return deleteByReference('IntSchema.Task', reference)
    .then(function () { return deleteByReference('IntSchema.ClaimEvent', reference) })
    .then(function () { return deleteByReference('IntSchema.ClaimBankDetail', reference) })
    .then(function () { return deleteByReference('IntSchema.ClaimDocument', reference) })
    .then(function () { return deleteByReference('IntSchema.ClaimExpense', reference) })
    .then(function () { return deleteByReference('IntSchema.ClaimChild', reference) })
    .then(function () { return deleteByReference('IntSchema.ClaimDeduction', reference) })
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
      Relationship: 'partner',
      Benefit: 'income-support',
      DWPBenefitCheckerResult: 'UNDETERMINED'
    },
    Claim: {
      ClaimType: 'first-time'
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
      'visit-confirmation': {
        DocumentType: 'VISIT-CONFIRMATION',
        DocumentStatus: 'uploaded',
        IsEnabled: 'true',
        Caseworker: 'test@test.com'
      },
      'benefit': {
        DocumentType: 'BENEFIT',
        DocumentStatus: 'uploaded',
        IsEnabled: 'true'
      },
      'expense': {
        DocumentType: 'RECEIPT',
        DocumentStatus: 'uploaded',
        IsEnabled: 'true'
      }
    },
    ClaimEvent: [
      {
        Event: 'Event text',
        AdditionalData: 'A note',
        Caseworker: 'Joe Bloggs',
        IsInternal: true
      },
      {
        Event: 'Event text 2',
        AdditionalData: 'Another note',
        Caseworker: 'Jane Bloggs',
        IsInternal: false
      }
    ]
  }
}
