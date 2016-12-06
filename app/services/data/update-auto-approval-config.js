const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const moment = require('moment')

module.exports = function (caseworker, autoApprovalEnabled, costVariancePercentage, maxClaimTotal,
  maxDaysAfterAPVUVisit, maxNumberOfClaimsPerYear, rulesDisabled) {
  // 'Disable' current auto approval config
  var latestEnabledRow = knex('AutoApprovalConfig')
    .where('IsEnabled', 'true')
    .orderBy('DateCreated', 'desc')
    .first('AutoApprovalConfigId')
  return knex('AutoApprovalConfig')
    .where('AutoApprovalConfigId', 'in', latestEnabledRow)
    .update('IsEnabled', 'false')
    .then(function () {
      // Insert new config
      return knex('AutoApprovalConfig')
        .insert({
          Caseworker: caseworker,
          DateCreated: moment().toDate(),
          AutoApprovalEnabled: autoApprovalEnabled,
          CostVariancePercentage: costVariancePercentage,
          MaxClaimTotal: maxClaimTotal,
          MaxDaysAfterAPVUVisit: maxDaysAfterAPVUVisit,
          MaxNumberOfClaimsPerYear: maxNumberOfClaimsPerYear,
          RulesDisabled: rulesDisabled,
          IsEnabled: 'true'
        })
        .returning('AutoApprovalConfigId')
    })
}
