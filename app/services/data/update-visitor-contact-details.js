const { getDatabaseConnector } = require('../../databaseConnector')
const insertClaimEvent = require('./insert-claim-event')
const claimEventEnum = require('../../constants/claim-event-enum')
const insertTaskSendClaimNotification = require('./insert-task-send-claim-notification')
const tasksEnum = require('../../constants/tasks-enum')

module.exports = (
  reference,
  eligibilityId,
  claimId,
  emailAddress,
  phoneNumber,
  previousEmailAddress,
  previousPhoneNumber,
  caseworker,
) => {
  const db = getDatabaseConnector()

  return db('Visitor')
    .where('EligibilityId', eligibilityId)
    .update({ EmailAddress: emailAddress, PhoneNumber: phoneNumber })
    .then(() => {
      const note = `Updated email address from ${previousEmailAddress} to ${emailAddress}, phone number from ${previousPhoneNumber} to ${phoneNumber}`
      return insertClaimEvent(
        reference,
        eligibilityId,
        claimId,
        claimEventEnum.UPDATED_CONTACT_DETAILS.value,
        null,
        note,
        caseworker,
        false,
      )
    })
    .then(() => {
      return Promise.all([
        insertTaskSendClaimNotification(
          tasksEnum.UPDATED_CONTACT_DETAILS_CLAIM_NOTIFICATION,
          reference,
          eligibilityId,
          claimId,
          emailAddress,
        ),
        insertTaskSendClaimNotification(
          tasksEnum.UPDATED_CONTACT_DETAILS_CLAIM_NOTIFICATION,
          reference,
          eligibilityId,
          claimId,
          previousEmailAddress,
        ),
      ])
    })
}
