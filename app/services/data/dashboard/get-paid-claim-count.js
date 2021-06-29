const { getDatabaseConnector } = require('../../../databaseConnector')
const applyFilter = require('./apply-filter')
const claimStatusEnum = require('../../../../app/constants/claim-status-enum')

module.exports = function (filter) {
  const db = getDatabaseConnector()

  return applyFilter(
    db('Claim')
      .count('ClaimId AS Count')
      .where(function () {
        this.where('PaymentStatus', 'PROCESSED')
          .orWhere(function () {
            // For Advance Claims
            this.where({
              IsAdvanceClaim: true,
              Status: claimStatusEnum.APPROVED_ADVANCE_CLOSED.value
            })
          })
      }),
    filter
  )
}
