const config = require('../../knexfile').migrations
const knex = require('knex')(config)
const moment = require('moment')
const databaseHelper = require('../helpers/database-setup-for-tests')

const DEFAULT_CHUNK_SIZE = 100
const DATE = moment('20010101').toDate()

var eligibilityData = []
var prisonerData = []
var visitorData = []
var claimData = []

module.exports.deleteAll = function () {
  return deleteTable('IntSchema.Task')
    .then(function () { return deleteTable('IntSchema.ClaimEvent') })
    .then(function () { return deleteTable('IntSchema.ClaimBankDetail') })
    .then(function () { return deleteTable('IntSchema.ClaimDocument') })
    .then(function () { return deleteTable('IntSchema.ClaimExpense') })
    .then(function () { return deleteTable('IntSchema.ClaimChild') })
    .then(function () { return deleteTable('IntSchema.ClaimDeduction') })
    .then(function () { return deleteTable('IntSchema.Claim') })
    .then(function () { return deleteTable('IntSchema.Visitor') })
    .then(function () { return deleteTable('IntSchema.Prisoner') })
    .then(function () { return deleteTable('IntSchema.Eligibility') })
}

module.exports.insertTestDataBatch = function (status, batchSize, isAdvance, isOverpaid) {
  // Set up test data
  generateEligibilityData(status, batchSize)
  generateClaimData(isAdvance, isOverpaid)

  return knex.batchInsert('IntSchema.Eligibility', eligibilityData, DEFAULT_CHUNK_SIZE)
    .then(function () { return knex.batchInsert('IntSchema.Prisoner', prisonerData, DEFAULT_CHUNK_SIZE) })
    .then(function () { return knex.batchInsert('IntSchema.Visitor', visitorData, DEFAULT_CHUNK_SIZE) })
    .then(function () { return knex.batchInsert('IntSchema.Claim', claimData, DEFAULT_CHUNK_SIZE, isAdvance, isOverpaid) })
}

function generateEligibilityData (status, batchSize) {
  for (let i = 0; i < batchSize; i++) {
    var reference = databaseHelper.generateReference()
    var uniqueId = Math.floor(Date.now() / 100) - 14000000000 + i
    eligibilityData.push(getEligibility(reference, uniqueId, status))
  }
}

function generateClaimData (isAdvance, isOverpaid) {
  eligibilityData.forEach(function (eligibility) {
    prisonerData.push(getPrisoner(eligibility.Reference, eligibility.EligibilityId, eligibility.EligibilityId))
    visitorData.push(getVisitor(eligibility.Reference, eligibility.EligibilityId, eligibility.EligibilityId))
    claimData.push(getClaim(eligibility.Reference, eligibility.EligibilityId, eligibility.EligibilityId, eligibility.Status, isAdvance, isOverpaid))
  })
}

function getEligibility (reference, id, status) {
  return {
    EligibilityId: id,
    Reference: reference,
    DateCreated: DATE,
    DateSubmitted: DATE,
    Status: status
  }
}

function getPrisoner (reference, eligibilityId, id) {
  return {
    PrisonerId: id,
    EligibilityId: eligibilityId,
    Reference: reference,
    FirstName: 'Test',
    LastName: 'Testing' + reference,
    DateOfBirth: moment('19840101').toDate(),
    PrisonNumber: 'A123456',
    NameOfPrison: 'Hewell'
  }
}

function getVisitor (reference, eligibilityId, id) {
  return {
    VisitorId: id,
    EligibilityId: eligibilityId,
    Reference: reference,
    FirstName: 'John',
    LastName: 'PerfTester' + reference,
    NationalInsuranceNumber: 'ZZ123456C',
    HouseNumberAndStreet: '123 Performance Testing Road',
    Town: 'Performance Town',
    County: 'Performance County',
    PostCode: 'BT111BT',
    Country: 'England',
    EmailAddress: 'donotsend@apvs.com',
    PhoneNumber: '07911111199',
    DateOfBirth: moment('19830404').toDate(),
    Relationship: 'partner',
    Benefit: 'income-support',
    DWPBenefitCheckerResult: 'UNDETERMINED'
  }
}

function getClaim (reference, eligibilityId, id, status, isAdvance, isOverPaid) {
  var visitDate = moment().subtract(Math.floor(Math.random() * 20) + 1, 'd')

  return {
    ClaimId: id,
    EligibilityId: eligibilityId,
    Reference: reference,
    DateOfJourney: visitDate.toDate(),
    DateCreated: DATE,
    DateSubmitted: DATE,
    ClaimType: 'first-time',
    IsAdvanceClaim: isAdvance,
    IsOverpaid: isOverPaid,
    OverpaymentAmount: isOverPaid ? (Math.floor(Math.random() * 30) + 1) : 0,
    Status: status
  }
}

function deleteTable (schemaTable) {
  return knex(schemaTable).del()
}
