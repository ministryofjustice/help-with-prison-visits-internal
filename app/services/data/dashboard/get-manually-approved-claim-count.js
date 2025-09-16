const { getDatabaseConnector } = require('../../../databaseConnector')
const claimStatusEnum = require('../../../constants/claim-status-enum')
const applyFilter = require('./apply-filter')

module.exports = filter => {
  const db = getDatabaseConnector()

  return applyFilter(db('Claim').count('ClaimId AS Count').where('Status', claimStatusEnum.APPROVED.value), filter)
}
