const { getDatabaseConnector } = require('../../databaseConnector')
const insertClaimEvent = require('./insert-claim-event')
const claimStatusEnum = require('../../constants/claim-status-enum')
const dateFormatter = require('../date-formatter')
const claimEventEnum = require('../../constants/claim-event-enum')

module.exports = (claimId, note) => {
  const db = getDatabaseConnector()

  return db('Claim')
    .where('ClaimId', claimId)
    .returning(['Reference', 'EligibilityId'])
    .update({ Status: claimStatusEnum.APPROVED.value, LastUpdated: dateFormatter.now().toDate(), PaymentStatus: null })
    .then(updatedClaimData => {
      const claim = updatedClaimData[0]
      return insertClaimEvent(
        claim.Reference,
        claim.EligibilityId,
        claimId,
        claimEventEnum.PAYOUT_BARCODE_EXPIRED.value,
        null,
        note,
        null,
        true,
      ).then(() => {
        return insertClaimEvent(
          claim.Reference,
          claim.EligibilityId,
          claimId,
          claimEventEnum.PAYMENT_REISSUED.value,
          null,
          null,
          null,
          true,
        )
      })
    })
}
