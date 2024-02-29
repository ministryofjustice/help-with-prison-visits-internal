const {
  getDatabaseConnector
} = require('../../../databaseConnector')

module.exports = function (reportId, checkStatus, verificationStatus, finalStatus) {
  const db = getDatabaseConnector()
  return db('AuditReport')
    .update({
      CheckStatus: checkStatus,
      VerificationStatus: verificationStatus,
      FinalStatus: finalStatus
    })
    .where({
      ReportId: reportId
    })
}
