const {
  getDatabaseConnector
} = require('../../../databaseConnector')
const dateFormatter = require('../../date-formatter')

module.exports = function (auditConfig) {
  const db = getDatabaseConnector()

  return db('AuditConfig')
    .orderBy('DateCreated', 'desc')
    .first('AuditConfigId')
    .then(function (currentAuditConfig) {
      if (currentAuditConfig) {
        return insertConfigData(auditConfig)
          .then(function (result) {
            // only disable current config if new config was set successfully
            const insertResult = result[0]
            return db('AuditConfig')
              .where('AuditConfigId', currentAuditConfig.AuditConfigId)
              .then(function () {
                return insertResult
              })
          })
      } else {
        return insertConfigData(auditConfig)
      }
    })
}

function insertConfigData (auditConfig) {
  const db = getDatabaseConnector()

  return db('AuditConfig')
    .insert({
      DateCreated: dateFormatter.now().toDate(),
      ThresholdAmount: auditConfig.thresholdAmount,
      VerificationPercent: auditConfig.verificationPercent
    })
    .returning('AuditConfigId')
}
