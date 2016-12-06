const config = require('../config')
const moment = require('moment')

exports.up = function (knex, Promise) {
  return knex.schema.createTable('AutoApprovalConfig', function (table) {
    table.increments('AutoApprovalConfigId')
    table.string('Caseworker', 100)
    table.dateTime('DateCreated')
    table.boolean('AutoApprovalEnabled')
    table.decimal('CostVariancePercentage')
    table.decimal('MaxClaimTotal')
    table.integer('MaxDaysAfterAPVUVisit')
    table.integer('MaxNumberOfClaimsPerYear')
    table.string('RulesDisabled', 4000)
    table.boolean('IsEnabled')
  })
  .then(function () {
    return knex('AutoApprovalConfig')
      .insert({
        Caseworker: null,
        DateCreated: moment().toDate(),
        AutoApprovalEnabled: config.AUTO_APPROVAL_ENABLED,
        CostVariancePercentage: config.AUTO_APPROVAL_COST_VARIANCE_PERCENTAGE,
        MaxClaimTotal: config.AUTO_APPROVAL_MAX_CLAIM_TOTAL,
        MaxDaysAfterAPVUVisit: config.AUTO_APPROVAL_MAX_DAYS_AFTER_APVU_VISIT,
        MaxNumberOfClaimsPerYear: config.AUTO_APPROVAL_MAX_NUMBER_OF_CLAIMS_PER_YEAR,
        RulesDisabled: null,
        IsEnabled: 'true'
      })
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}

exports.down = function (knex, Promise) {
  return knex('AutoApprovalConfig')
    .del()
    .then(function () {
      return knex.schema.dropTable('AutoApprovalConfig')
    })
}
