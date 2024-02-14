const {
  getDatabaseConnector
} = require('../../../databaseConnector')

module.exports = function () {
  const db = getDatabaseConnector()

  return db('AuditConfig')
    .orderBy('DateCreated', 'desc')
    .first()
    .then(function (auditConfig) {
      if (auditConfig) {
        return auditConfig
      } else {
        return getDefaults()
      }
    })
}

function getDefaults () {
  return {
    ThresholdAmount: 0,
    VerificationPercent: 0
  }
}
