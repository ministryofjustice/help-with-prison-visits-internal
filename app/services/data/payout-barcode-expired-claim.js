const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const insertClaimEvent = require('./insert-claim-event')
const claimStatusEnum = require('../../constants/claim-status-enum')
const dateFormatter = require('../date-formatter')
const claimEventEnum = require('../../constants/claim-event-enum')

module.exports = function (claimId, note) {
  return knex('Claim')
    .where('ClaimId', claimId)
    .returning(['Reference', 'EligibilityId'])
    .update({ Status: claimStatusEnum.APPROVED.value, LastUpdated: dateFormatter.now().toDate(), PaymentStatus: null })
    .then(function (updatedClaimData) {
      var claim = updatedClaimData[0]
      return insertClaimEvent(claim.Reference, claim.EligibilityId, claimId, claimEventEnum.PAYOUT_BARCODE_EXPIRED.value, null, note, null, true)
        .then(function () {
          return insertClaimEvent(claim.Reference, claim.EligibilityId, claimId, claimEventEnum.PAYMENT_REISSUED.value, null, null, null, true)
        })
    })
}
