const insertTaskSendClaimNotification = require('./insert-task-send-claim-notification')
const insertClaimEvent = require('./insert-claim-event')
const updateClaimStatusRequestingBankDetails = require('./update-claim-status-requesting-bank-details')
const tasksEnum = require('../../constants/tasks-enum')

module.exports = function (reference, eligibilityId, claimId, additionalInformation, user) {
  var promises = []

  promises.push(updateClaimStatusRequestingBankDetails(reference, claimId))
  promises.push(insertClaimEvent(reference, eligibilityId, claimId, 'Request new bank details', additionalInformation, '', user, false))
  promises.push(insertTaskSendClaimNotification(tasksEnum.REQUEST_INFORMATION_CLAIM_NOTIFICATION, reference, eligibilityId, claimId))

  return Promise.all(promises)
}
