const { getDatabaseConnector } = require('../../../databaseConnector')

module.exports = reportId => {
  const db = getDatabaseConnector()
  return db('AuditReport')
    .update({
      IsDeleted: true,
    })
    .where({
      ReportId: reportId,
    })
    .then(() => {
      return db('ReportData').select('ClaimId').where({
        ReportId: reportId,
      })
    })
    .then(claimList => {
      const claimIdList = claimList.map(claim => claim.ClaimId)
      return db('Claim')
        .update({
          IsIncludedInAudit: false,
        })
        .whereIn('ClaimId', claimIdList)
    })
}
