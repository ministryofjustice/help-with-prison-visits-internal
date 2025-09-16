const { getDatabaseConnector } = require('../../databaseConnector')
const insertClaimEvent = require('./insert-claim-event')
const claimStatusEnum = require('../../constants/claim-status-enum')
const claimEventEnum = require('../../constants/claim-event-enum')
const dateFormatter = require('../date-formatter')
const log = require('../log')

module.exports = (claimId, note, email) => {
  const db = getDatabaseConnector()

  return db('Claim')
    .where('ClaimId', claimId)
    .returning(['Reference', 'EligibilityId'])
    .update({ Status: claimStatusEnum.APPROVED_ADVANCE_CLOSED.value, LastUpdated: dateFormatter.now().toDate() })
    .then(updatedClaimData => {
      log.info(`Advance Claim ${claimId} Closed`)
      const claim = updatedClaimData[0]
      return insertClaimEvent(
        claim.Reference,
        claim.EligibilityId,
        claimId,
        claimEventEnum.CLOSE_ADVANCE_CLAIM.value,
        null,
        note,
        email,
        false,
      )
    })
}
