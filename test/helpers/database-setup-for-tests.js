const config = require('../../knexfile').migrations
const knex = require('knex')(config)

// TODO extract sample data into separate object so you can retrieve it and use in tests, so if it is updated it won't break tests
module.exports.insertTestData = function (reference, date, status, visitDate, increment, paymentStatus = null) {
  const idIncrement = increment || 0
  // Generate unique Integer for Ids using timestamp in tenth of seconds
  const uniqueId = Math.floor(Date.now() / 100) - 14000000000 + idIncrement

  return this.insertTestDataForIds(reference, date, status, visitDate, uniqueId, uniqueId + 1, uniqueId + 2, uniqueId + 3, paymentStatus)
}

module.exports.insertTestDataForIds = function (reference, date, status, visitDate, uniqueId, uniqueId2, uniqueId3, uniqueId4, paymentStatus) {
  const data = this.getTestData(reference, status)

  const ids = {}
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
        .returning(['ClaimId', 'LastUpdated'])
        .insert({
          ClaimId: uniqueId,
          EligibilityId: ids.eligibilityId,
          Reference: reference,
          DateOfJourney: visitDate || date,
          DateCreated: date,
          DateSubmitted: date,
          ClaimType: data.Claim.ClaimType,
          IsAdvanceClaim: data.Claim.IsAdvanceClaim,
          IsOverpaid: data.Claim.IsOverpaid,
          OverpaymentAmount: data.Claim.OverpaymentAmount,
          Status: status,
          PaymentMethod: data.Claim.PaymentMethod,
          AssignedTo: data.Claim.AssignedTo,
          AssignmentExpiry: new Date(date.getTime() + 300000), // current time + 5 minutes
          PaymentStatus: paymentStatus
        })
    })
    .then(function (result) {
      ids.claimId = result[0].ClaimId
      ids.lastUpdated = result[0].LastUpdated
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
          FirstName: data.ClaimChild[0].FirstName,
          LastName: data.ClaimChild[0].LastName,
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
          FirstName: data.ClaimChild[1].FirstName,
          LastName: data.ClaimChild[1].LastName,
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
          Filepath: '/example/path/1',
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
          DocumentType: data.ClaimDocument.benefit.DocumentType,
          DocumentStatus: data.ClaimDocument.benefit.DocumentStatus,
          Filepath: '/example/path/2',
          DateSubmitted: date,
          IsEnabled: data.ClaimDocument.benefit.IsEnabled
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
          DocumentType: data.ClaimDocument.expense.DocumentType,
          DocumentStatus: data.ClaimDocument.expense.DocumentStatus,
          Filepath: '/example/path/3',
          DateSubmitted: date,
          IsEnabled: data.ClaimDocument.expense.IsEnabled
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
          DocumentType: data.ClaimDocument.expense.DocumentType,
          DocumentStatus: data.ClaimDocument.expense.DocumentStatus,
          Filepath: '/example/path/4',
          DateSubmitted: date,
          IsEnabled: data.ClaimDocument.expense.IsEnabled
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
      return insertClaimDeduction(uniqueId, reference, ids.eligibilityId, data.ClaimDeduction.hc3.DeductionType, data.ClaimDeduction.hc3.Amount)
    })
    .then(function (result) {
      ids.claimDeductionId1 = result[0]
      return insertClaimDeduction(uniqueId, reference, ids.eligibilityId, data.ClaimDeduction.overpayment.DeductionType, data.ClaimDeduction.overpayment.Amount)
    })
    .then(function (result) {
      ids.claimDeductionId2 = result[0]
      return insertClaimEscort(uniqueId, reference, ids.eligibilityId, data.ClaimEscort)
    })
    .then(function (result) {
      ids.claimEscortId = result[0]
      return ids
    })
}

function deleteByReference (schemaTable, reference) {
  return knex(schemaTable).where('Reference', reference).del()
}

function deleteByClaimIds (schemaTable, claimIds) {
  return knex(schemaTable).whereIn('ClaimId', claimIds).del()
}

function getClaimIdsForReference (schemaTable, reference) {
  return knex(schemaTable).where('Reference', reference).select('ClaimId')
    .then(function (results) {
      const claimIdArray = []
      results.forEach(function (result) {
        claimIdArray.push(result.ClaimId)
      })
      return claimIdArray
    })
}

module.exports.deleteAll = function (reference) {
  return deleteByReference('IntSchema.Task', reference)
    .then(function () { return deleteByReference('IntSchema.ClaimEvent', reference) })
    .then(function () { return deleteByReference('IntSchema.ClaimBankDetail', reference) })
    .then(function () { return deleteByReference('IntSchema.ClaimDocument', reference) })
    .then(function () { return deleteByReference('IntSchema.ClaimExpense', reference) })
    .then(function () { return deleteByReference('IntSchema.ClaimChild', reference) })
    .then(function () { return deleteByReference('IntSchema.ClaimDeduction', reference) })
    .then(function () { return deleteByReference('IntSchema.ClaimEscort', reference) })
    .then(function () { return getClaimIdsForReference('IntSchema.Claim', reference) })
    .then(function (claimIds) { return deleteByClaimIds('IntSchema.TopUp', claimIds) })
    .then(function () { return deleteByReference('IntSchema.Claim', reference) })
    .then(function () { return deleteByReference('IntSchema.Visitor', reference) })
    .then(function () { return deleteByReference('IntSchema.Prisoner', reference) })
    .then(function () { return deleteByReference('IntSchema.Eligibility', reference) })
}

module.exports.getTestData = function (reference, status) {
  return {
    Prisoner: {
      FirstName: 'TestFirst',
      LastName: 'TestLast',
      PrisonNumber: 'A123456',
      NameOfPrison: 'Test'
    },
    Visitor: {
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
      ClaimType: 'first-time',
      IsAdvanceClaim: false,
      IsOverpaid: false,
      OverpaymentAmount: 20,
      PaymentMethod: 'bank',
      AssignedTo: 'TestUser@test.com'
    },
    ClaimExpenses: [{
      ExpenseType: 'train',
      Cost: 12,
      From: 'London',
      To: 'Hewell',
      IsReturn: true
    },
    {
      ExpenseType: 'accommodation',
      Cost: 80,
      DurationOfTravel: 1
    }],
    ClaimChild: [{
      FirstName: 'Jane',
      LastName: 'Bloggs',
      DateOfBirth: '01-09-2005',
      Relationship: 'prisoners-child'
    },
    {
      FirstName: 'Michael',
      LastName: 'Bloggs',
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
      benefit: {
        DocumentType: 'BENEFIT',
        DocumentStatus: 'uploaded',
        IsEnabled: 'true'
      },
      expense: {
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
    ],
    ClaimDeduction: {
      overpayment: {
        Amount: 5,
        DeductionType: 'overpayment',
        IsEnabled: true
      },
      hc3: {
        Amount: 10,
        DeductionType: 'hc3',
        IsEnabled: true
      }
    },
    ClaimEscort: {
      FirstName: 'Escort',
      LastName: 'Person',
      DateOfBirth: '01-01-1990'
    }
  }
}

module.exports.insertClaim = function (claimId, eligibilityId, reference, date, status, isOverpaid, overpaymentAmount, remainingOverpaymentAmount, isAdvanceClaim, paymentStatus) {
  return knex('Claim')
    .returning('ClaimId')
    .insert({
      ClaimId: claimId,
      EligibilityId: eligibilityId,
      Reference: reference,
      DateOfJourney: date,
      DateCreated: date,
      DateSubmitted: date,
      Status: status,
      IsOverpaid: isOverpaid,
      OverpaymentAmount: overpaymentAmount,
      RemainingOverpaymentAmount: remainingOverpaymentAmount,
      IsAdvanceClaim: isAdvanceClaim,
      PaymentStatus: paymentStatus
    })
}

function insertClaimDeduction (claimId, reference, eligibilityId, deductionType, amount) {
  return knex('ClaimDeduction')
    .returning('ClaimDeductionId')
    .insert({
      EligibilityId: eligibilityId,
      Reference: reference,
      ClaimId: claimId,
      DeductionType: deductionType,
      Amount: amount,
      IsEnabled: true
    })
}

function insertClaimEscort (claimId, reference, eligibilityId, escortData) {
  return knex('ClaimEscort')
    .returning('ClaimEscortId')
    .insert({
      ClaimEscortId: claimId,
      ClaimId: claimId,
      EligibilityId: eligibilityId,
      Reference: reference,
      FirstName: escortData.FirstName,
      LastName: escortData.LastName,
      DateOfBirth: escortData.DateOfBirth,
      IsEnabled: true
    })
}

module.exports.getBenefitExpiryDate = function (reference) {
  return knex('IntSchema.Visitor')
    .first('BenefitExpiryDate')
    .where('Reference', reference)
}

module.exports.getLastTopUpAdded = function getLastTopUpAdded (claimId) {
  return knex('IntSchema.TopUp')
    .first()
    .where('ClaimId', claimId)
    .then(function (result) {
      result.TopUpAmount = Number(result.TopUpAmount).toFixed(2)
      return result
    })
}

module.exports.insertClaimDeduction = insertClaimDeduction
