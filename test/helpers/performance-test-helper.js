const config = require('../../knexfile').migrations
const knex = require('knex')(config)
const moment = require('moment')
const databaseHelper = require('../helpers/database-setup-for-tests')
const Promise = require('bluebird').Promise

const DEFAULT_CHUNK_SIZE = 100
const DATE = moment('20010101').toDate()

var eligibilityData = []

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

module.exports.insertTestDataBatch = function (status) {
  return generateEligibilityData(status).then(function () {
    console.log('Execute bulk insert')
    return knex.batchInsert('IntSchema.Eligibility', eligibilityData, 10)
      .returning('EligibilityId')
      .then(function (ids) {
        console.log('Eligibility records inserted: ' + ids.length)
      })
  })
}

function generateEligibilityData (status) {
  return new Promise(function () {
    for (let i = 0; i < DEFAULT_CHUNK_SIZE; i++) {
      var reference = databaseHelper.generateReference()
      var uniqueId = Math.floor(Date.now() / 100) - 14000000000 + i
      eligibilityData.push(getEligibility(reference, uniqueId, status))
    }
  })
}

function getEligibility (reference, id, status) {
  console.log('Adding id ' + id)
  return {
    Reference: reference,
    DateCreated: DATE,
    DateSubmitted: DATE,
    Status: status
  }
}


function deleteTable (schemaTable) {
  return knex(schemaTable).del()
}
