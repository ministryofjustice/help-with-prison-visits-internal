const moment = require('moment')
const {
  getDatabaseConnector
} = require('../../../databaseConnector')
module.exports = function (claims, startDate, endDate, claimCount) {
  const db = getDatabaseConnector()
  return db('Claim')
    .update({
      IsIncludedInAudit: true
    })
    .whereIn('Reference', Array.from(claims, claim => claim.Reference))
    .then(function () {
      return db('AuditReport').insert({
        StartDate: startDate,
        EndDate: moment(endDate).subtract(1, 'seconds').toDate(),
        IsDeleted: false,
        CheckStatus: 'NotStarted',
        VerificationStatus: 'NotStarted',
        FinalStatus: 'NotStarted'
      })
        .returning('ReportId')
    })
    .then(function (auditReport) {
      const reportDataToInsert = claims.map(claim =>
        ({
          ReportId: auditReport[0].ReportId,
          Reference: claim.Reference,
          ClaimId: claim.ClaimId,
          Caseworker: claim.Caseworker,
          PaymentAmount: claim.PaymentAmount,
          Band5Validity: 'Not checked',
          Band9Validity: '',
          Band5Username: ''
        }))
      return db('ReportData').insert(reportDataToInsert).then(function () {
        return auditReport[0].ReportId
      })
    })
}
