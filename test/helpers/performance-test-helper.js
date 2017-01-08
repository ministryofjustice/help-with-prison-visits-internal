const config = require('../../knexfile').migrations
const knex = require('knex')(config)
const moment = require('moment')
const databaseHelper = require('../helpers/database-setup-for-tests')

const DEFAULT_CHUNK_SIZE = 100
const DATE = moment('20010101').toDate()

var eligibilityData = []
var prisonerData = []

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

module.exports.insertTestDataBatch = function (status, batchSize) {
  // Set up test data
  generateEligibilityData(status, batchSize)
  generateClaimData()

  return knex.batchInsert('IntSchema.Eligibility', eligibilityData, DEFAULT_CHUNK_SIZE)
    .then(function () { return knex.batchInsert('IntSchema.Prisoner', prisonerData, DEFAULT_CHUNK_SIZE) })
}

function generateEligibilityData (status, batchSize) {
  for (let i = 0; i < batchSize; i++) {
    var reference = databaseHelper.generateReference()
    var uniqueId = Math.floor(Date.now() / 100) - 14000000000 + i
    eligibilityData.push(getEligibility(reference, uniqueId, status))
  }
}

function generateClaimData () {
  eligibilityData.forEach(function (eligibility) {
    prisonerData.push(getPrisoner(eligibility.Reference, eligibility.EligibilityId, eligibility.EligibilityId))
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
    LastName: 'Testing',
    DateOfBirth: moment('19840101').toDate(),
    PrisonNumber: 'A123456',
    NameOfPrison: 'Hewell'
  }
}

function deleteTable (schemaTable) {
  return knex(schemaTable).del()
}
