const { getDatabaseConnector } = require('../../../databaseConnector')
const claimStatusEnum = require('../../../constants/claim-status-enum')
const applyFilter = require('./apply-filter')

module.exports = filter => {
  const db = getDatabaseConnector()

  return applyFilter(
    db('Claim')
      .count('ClaimId AS Count')
      .whereIn('Status', [
        claimStatusEnum.NEW.value,
        claimStatusEnum.UPDATED.value,
        claimStatusEnum.REQUEST_INFORMATION.value,
        claimStatusEnum.REQUEST_INFO_PAYMENT.value,
      ]),
    filter,
  )
}
