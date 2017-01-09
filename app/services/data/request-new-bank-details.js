const insertTaskSendClaimNotification = require('./insert-task-send-claim-notification')
const insertClaimEvent = require('./insert-claim-event')
const updateClaimStatusRequestingBankDetails = require('./update-claim-status-requesting-bank-details')
const taskEnum = require('../../constants/task-enum')

module.exports = function (reference, eligibilityId, claimId, note, user) {
  var promises = []

  promises.push(updateClaimStatusRequestingBankDetails(reference, claimId))
  promises.push(insertClaimEvent(reference, eligibilityId, claimId, 'Request new bank details', '', note, user, true))
  promises.push(insertTaskSendClaimNotification(taskEnum.REQUEST_INFORMATION_CLAIM_NOTIFICATION, reference, eligibilityId, claimId))

  return Promise.all(promises)
}
