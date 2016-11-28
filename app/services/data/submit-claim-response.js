const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const moment = require('moment')
const claimDecisionEnum = require('../../constants/claim-decision-enum')
const tasksEnum = require('../../constants/tasks-enum')
const insertClaimEvent = require('./insert-claim-event')
const insertTaskSendClaimNotification = require('./insert-task-send-claim-notification')

module.exports = function (claimId, claimDecision) {
  return knex('Claim').where('ClaimId', claimId)
    .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
    .first('Eligibility.EligibilityId', 'Eligibility.Reference')
    .then(function (result) {
      var eligibilityId = result.EligibilityId
      var reference = result.Reference
      var caseworker = claimDecision.caseworker
      var decision = claimDecision.decision
      var reason = claimDecision.reason
      var note = claimDecision.note
      var nomisCheck = claimDecision.nomisCheck
      var dwpCheck = claimDecision.dwpCheck
      var visitConfirmationCheck = claimDecision.visitConfirmationCheck

      return Promise.all([updateEligibility(eligibilityId, decision),
        updateClaim(claimId, caseworker, decision, reason, note, visitConfirmationCheck),
        updateVisitor(eligibilityId, dwpCheck),
        updatePrisoner(eligibilityId, nomisCheck),
        updateClaimExpenses(claimDecision.claimExpenseResponses),
        insertClaimEventForDecision(reference, eligibilityId, claimId, decision, note, caseworker),
        sendClaimNotification(reference, eligibilityId, claimId, decision)])
    })
}

function updateEligibility (eligibilityId, decision) {
  return knex('Eligibility').where('EligibilityId', eligibilityId).update('Status', decision)
}

function updateClaim (claimId, caseworker, decision, reason, note, visitConfirmationCheck) {
  return knex('Claim').where('ClaimId', claimId).update({
    'Caseworker': caseworker,
    'Status': decision,
    'Reason': reason,
    'Note': note,
    'VisitConfirmationCheck': visitConfirmationCheck,
    'LastUpdated': moment().toDate()
  })
}

function updateVisitor (eligibilityId, dwpCheck) {
  return knex('Visitor').where('EligibilityId', eligibilityId).update('DWPCheck', dwpCheck)
}

function updatePrisoner (eligibilityId, nomisCheck) {
  return knex('Prisoner').where('EligibilityId', eligibilityId).update('NomisCheck', nomisCheck)
}

function updateClaimExpenses (claimExpenseResponses) {
  var updates = []
  if (claimExpenseResponses) {
    claimExpenseResponses.forEach(function (claimExpenseResponse) {
      updates.push(updateClaimExpense(claimExpenseResponse))
    })
  }
  return Promise.all(updates)
}

function updateClaimExpense (claimExpenseResponse) {
  return knex('ClaimExpense').where('ClaimExpenseId', claimExpenseResponse.claimExpenseId).update({
    'ApprovedCost': claimExpenseResponse.approvedCost,
    'Status': claimExpenseResponse.status
  })
}

function insertClaimEventForDecision (reference, eligibilityId, claimId, decision, note, caseworker) {
  const event = `CLAIM-${decision}`
  return insertClaimEvent(reference, eligibilityId, claimId, event, null, note, caseworker, false)
}

function sendClaimNotification (reference, eligibilityId, claimId, decision) {
  var notificationType
  if (decision === claimDecisionEnum.APPROVED) {
    notificationType = tasksEnum.ACCEPT_CLAIM_NOTIFICATION
  } else if (decision === claimDecisionEnum.REJECTED) {
    notificationType = tasksEnum.REJECT_CLAIM_NOTIFICATION
  } else if (decision === claimDecisionEnum.REQUEST_INFORMATION) {
    notificationType = tasksEnum.REQUEST_INFORMATION_CLAIM_NOTIFICATION
  }

  return insertTaskSendClaimNotification(notificationType, reference, eligibilityId, claimId)
}
