const { getDatabaseConnector } = require('../../../databaseConnector')
const config = require('../../../../config')

module.exports = () => {
  const db = getDatabaseConnector()

  return db('AuditConfig')
    .orderBy('DateCreated', 'desc')
    .first()
    .then(auditConfig => {
      if (auditConfig) {
        return auditConfig
      }
      return getDefaults()
    })
}

function getDefaults() {
  return {
    ThresholdAmount: config.AUDIT_THRESHOLD_AMOUNT,
    VerificationPercent: config.AUDIT_VERIFICATION_PERCENT,
  }
}
