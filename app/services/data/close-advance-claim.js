const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const insertClaimEvent = require('./insert-claim-event')
const claimStatusEnum = require('../../constants/claim-status-enum')
const claimEventEnum = require('../../constants/claim-event-enum')
const dateFormatter = require('../date-formatter')
const log = require('../log')

module.exports = function (claimId, note, email) {
  return knex('Claim')
    .where('ClaimId', claimId)
    .returning(['Reference', 'EligibilityId'])
    .update({ Status: claimStatusEnum.APPROVED_ADVANCE_CLOSED.value, LastUpdated: dateFormatter.now().toDate() })
    .then(function (updatedClaimData) {
      log.info('Advance Claim ' + claimId + ' Closed')
      var claim = updatedClaimData[0]
      return insertClaimEvent(claim.Reference, claim.EligibilityId, claimId, claimEventEnum.CLOSE_ADVANCE_CLAIM.value, null, note, email, false)
    })
}
