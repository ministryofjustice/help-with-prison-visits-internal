const { getDatabaseConnector } = require('../../../databaseConnector')
const dateFormatter = require('../../date-formatter')

module.exports = auditConfig => {
  const db = getDatabaseConnector()

  return db('AuditConfig')
    .orderBy('DateCreated', 'desc')
    .first('AuditConfigId')
    .then(currentAuditConfig => {
      if (currentAuditConfig) {
        return insertConfigData(auditConfig).then(result => {
          // only disable current config if new config was set successfully
          const insertResult = result[0]
          return db('AuditConfig')
            .where('AuditConfigId', currentAuditConfig.AuditConfigId)
            .then(() => {
              return insertResult
            })
        })
      }
      return insertConfigData(auditConfig)
    })
}

function insertConfigData(auditConfig) {
  const db = getDatabaseConnector()

  return db('AuditConfig')
    .insert({
      DateCreated: dateFormatter.now().toDate(),
      ThresholdAmount: auditConfig.thresholdAmount,
      VerificationPercent: auditConfig.verificationPercent,
    })
    .returning('AuditConfigId')
}
