const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const dateFormatter = require('../date-formatter')
const tasksEnum = require('../../constants/tasks-enum')
const insertClaimEvent = require('./insert-claim-event')
const insertTaskSendClaimNotification = require('./insert-task-send-claim-notification')
const log = require('../log')

module.exports = function (claimId, claimNote) {
  return knex('Claim').where('ClaimId', claimId)
    .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
    .first('Eligibility.EligibilityId', 'Eligibility.Reference')
    .then(function (result) {
      var eligibilityId = result.EligibilityId
      var reference = result.Reference
      var caseworker = result.caseworker
      var decision = result.decision
      var note = claimNote
      var nomisCheck = result.nomisCheck
      var dwpCheck = result.dwpCheck
      var visitConfirmationCheck = result.visitConfirmationCheck
      var rejectionReasonId = result.rejectionReasonId

      return Promise.all([updateClaim(claimId, note),
        insertClaimEventForNote(reference, eligibilityId, claimId, decision, note, caseworker),
        sendClaimNotification(reference, eligibilityId, claimId, decision)])
    })
}

function updateClaim (claimId, note) {
  var updateObject = {}

  updateObject = {
    'Note': note,
    'LastUpdated': dateFormatter.now().toDate()
  }

  if (updateObject.Note.length > 250) {
    updateObject.Note = updateObject.Note.substring(0, 250)
  }

  return knex('Claim').where('ClaimId', claimId).update(updateObject).then(
    log.info('Claim ID ' + claimId + ' note added: ' + updateObject.Note)
  )
}

function insertClaimEventForNote (reference, eligibilityId, claimId, decision, note, caseworker) {
  const event = `CLAIM-NOTE`
  return insertClaimEvent(reference, eligibilityId, claimId, event, null, note, 'Note', false)
}

function sendClaimNotification (reference, eligibilityId, claimId, decision) {
  var notificationType
  
  notificationType = tasksEnum.REQUEST_INFORMATION_CLAIM_NOTIFICATION
  
  return insertTaskSendClaimNotification(notificationType, reference, eligibilityId, claimId)
}
