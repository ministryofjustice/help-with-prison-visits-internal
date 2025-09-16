const { getDatabaseConnector } = require('../../../databaseConnector')
const applyFilter = require('./apply-filter')
const claimStatusEnum = require('../../../constants/claim-status-enum')

module.exports = filter => {
  const db = getDatabaseConnector()

  return applyFilter(
    db('Claim')
      .count('ClaimId AS Count')
      .where(function whereQuery() {
        this.where('PaymentStatus', 'PROCESSED').orWhere(function orWhereQuery() {
          // For Advance Claims
          this.where({
            IsAdvanceClaim: true,
            Status: claimStatusEnum.APPROVED_ADVANCE_CLOSED.value,
          })
        })
      }),
    filter,
  )
}
