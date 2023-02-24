const { getDatabaseConnector } = require('../../databaseConnector')
const claimEventEnum = require('../../constants/claim-event-enum')
const closedClaimStatusMap = require('../../constants/closed-claim-status-map')

module.exports = function (claimIds) {
  const claimEvents = [
    claimEventEnum.REQUEST_NEW_BANK_DETAILS.value,
    claimEventEnum.PAYOUT_BARCODE_EXPIRED.value,
    claimEventEnum.PAYMENT_REISSUED.value,
    claimEventEnum.CLAIM_APPROVED.value,
    claimEventEnum.CLAIM_AUTO_APPROVED.value,
    claimEventEnum.CLAIM_REJECTED.value,
    claimEventEnum.CLAIM_UPDATED.value
  ]
  const db = getDatabaseConnector()

  return db('ClaimEvent')
    .select('ClaimId', 'Event')
    .whereIn('Event', claimEvents)
    .andWhere(function () {
      this.whereIn('ClaimId', claimIds)
    })
    .orderBy([
      { column: 'ClaimId', order: 'desc' },
      { column: 'ClaimEventId', order: 'desc' }
    ])
    .then(function (events) {
      return events.reduce(function (statuses, event) {
        if (!statuses[event.ClaimId]) {
          if (event && event !== null && event !== undefined) {
            statuses[event.ClaimId] = closedClaimStatusMap[event.Event]
          } else {
            statuses[event.ClaimId] = 'Closed'
          }
        }

        return statuses
      }, {})
    })
}
