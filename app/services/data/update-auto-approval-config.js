const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const dateFormatter = require('../date-formatter')

module.exports = function (autoApprovalConfig) {
  return knex('AutoApprovalConfig')
    .where('IsEnabled', 'true')
    .orderBy('DateCreated', 'desc')
    .first('AutoApprovalConfigId')
    .then(function (result) {
      if (result) {
        return insertConfigData(autoApprovalConfig)
        .then(function (result) {
          // only disable current config if new config was set successfully
          var insertResult = result
          return knex('AutoApprovalConfig')
            .where('AutoApprovalConfigId', result.AutoApprovalConfigId)
            .update('IsEnabled', 'false')
            .then(function () {
              return insertResult
            })
        })
      } else {
        return insertConfigData(autoApprovalConfig)
      }
    })
}

function insertConfigData (autoApprovalConfig) {
  var rulesDisabledJoined = null
  if (autoApprovalConfig.rulesDisabled) {
    rulesDisabledJoined = autoApprovalConfig.rulesDisabled.join()
  }

  return knex('AutoApprovalConfig')
    .insert({
      Caseworker: autoApprovalConfig.caseworker,
      DateCreated: dateFormatter.now().toDate(),
      AutoApprovalEnabled: autoApprovalConfig.autoApprovalEnabled,
      CostVariancePercentage: autoApprovalConfig.costVariancePercentage,
      MaxClaimTotal: autoApprovalConfig.maxClaimTotal,
      MaxDaysAfterAPVUVisit: autoApprovalConfig.maxDaysAfterAPVUVisit,
      MaxNumberOfClaimsPerYear: autoApprovalConfig.maxNumberOfClaimsPerYear,
      MaxNumberOfClaimsPerMonth: autoApprovalConfig.maxNumberOfClaimsPerMonth,
      RulesDisabled: rulesDisabledJoined,
      IsEnabled: 'true'
    })
    .returning('AutoApprovalConfigId')
}
