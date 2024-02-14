const {
  getDatabaseConnector
} = require('../../../databaseConnector')

module.exports = function (reportId, noOfValidClaimsToBeVerified) {
  const db = getDatabaseConnector()
  return db('ReportData')
    .update({
      Band9Validity: 'Not verified'
    })
    .where({
      ReportId: reportId,
      Band5Validity: 'Invalid'
    })
    .then(function () {
      return db('ReportData')
        .select('Reference')
        .where({
          Band9Validity: '',
          ReportId: reportId
        })
        .orderByRaw('NEWID()')
        .limit(noOfValidClaimsToBeVerified)
        .then(function (refList) {
          const referenceList = refList.map(ref => ref.Reference)
          return db('ReportData')
            .update({
              Band9Validity: 'Not verified'
            })
            .whereIn('Reference', referenceList)
            .andWhere('ReportId', reportId)
        })
        .then(function () {
          return db('ReportData')
            .update({
              Band9Validity: 'Not required'
            })
            .andWhere({
              ReportId: reportId,
              Band9Validity: ''
            })
        })
    })
}
