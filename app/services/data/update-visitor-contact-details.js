const Promise = require('bluebird')
const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const insertClaimEvent = require('./insert-claim-event')
const claimEventEnum = require('../../constants/claim-event-enum')
const insertTaskSendClaimNotification = require('./insert-task-send-claim-notification')
const tasksEnum = require('../../constants/tasks-enum')

module.exports = function (reference, eligibilityId, claimId, emailAddress, phoneNumber, previousEmailAddress, previousPhoneNumber, caseworker) {
  return knex('Visitor')
    .where('EligibilityId', eligibilityId)
    .update({ EmailAddress: emailAddress, PhoneNumber: phoneNumber })
    .then(function () {
      var note = `Updated email address from ${previousEmailAddress} to ${emailAddress}, phone number from ${previousPhoneNumber} to ${phoneNumber}`
      return insertClaimEvent(reference, eligibilityId, claimId, claimEventEnum.UPDATED_CONTACT_DETAILS.value, null, note, caseworker, false)
    })
    .then(function () {
      return Promise.all([
        insertTaskSendClaimNotification(tasksEnum.UPDATED_CONTACT_DETAILS_CLAIM_NOTIFICATION, reference, eligibilityId, claimId, emailAddress),
        insertTaskSendClaimNotification(tasksEnum.UPDATED_CONTACT_DETAILS_CLAIM_NOTIFICATION, reference, eligibilityId, claimId, previousEmailAddress)
      ])
    })
}
