const defaultsConfig = require('../../../config')
const { getDatabaseConnector } = require('../../databaseConnector')
const dateFormatter = require('../date-formatter')

module.exports = autoApprovalConfig => {
  const db = getDatabaseConnector()

  return db('AutoApprovalConfig')
    .where('IsEnabled', 'true')
    .orderBy('DateCreated', 'desc')
    .first('AutoApprovalConfigId')
    .then(currentAutoApprovalConfig => {
      if (currentAutoApprovalConfig) {
        return insertConfigData(autoApprovalConfig).then(result => {
          // only disable current config if new config was set successfully
          const insertResult = result[0]
          return db('AutoApprovalConfig')
            .where('AutoApprovalConfigId', currentAutoApprovalConfig.AutoApprovalConfigId)
            .update('IsEnabled', 'false')
            .then(() => {
              return insertResult
            })
        })
      }
      return insertConfigData(autoApprovalConfig)
    })
}

function insertConfigData(autoApprovalConfig) {
  const db = getDatabaseConnector()

  let rulesDisabledJoined = null
  if (autoApprovalConfig.rulesDisabled) {
    rulesDisabledJoined = autoApprovalConfig.rulesDisabled.join()
  }
  return db('AutoApprovalConfig')
    .insert({
      Caseworker: autoApprovalConfig.caseworker,
      DateCreated: dateFormatter.now().toDate(),
      AutoApprovalEnabled: autoApprovalConfig.autoApprovalEnabled,
      CostVariancePercentage: autoApprovalConfig.costVariancePercentage,
      MaxClaimTotal: autoApprovalConfig.maxClaimTotal,
      MaxDaysAfterAPVUVisit: autoApprovalConfig.maxDaysAfterAPVUVisit,
      MaxNumberOfClaimsPerYear: autoApprovalConfig.maxNumberOfClaimsPerYear,
      MaxNumberOfClaimsPerMonth: autoApprovalConfig.maxNumberOfClaimsPerMonth,
      NumberOfConsecutiveAutoApprovals: autoApprovalConfig.numberOfConsecutiveAutoApprovals,
      RulesDisabled: rulesDisabledJoined,
      CostPerMile: defaultsConfig.AUTO_APPROVAL_COST_PER_MILE,
      IsEnabled: 'true',
    })
    .returning('AutoApprovalConfigId')
}
