const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const claimDecisionEnum = require('../../constants/claim-decision-enum')
const tasksEnum = require('../../constants/tasks-enum')
const insertTaskSendClaimNotification = require('./insert-task-send-claim-notification')

module.exports = function (claimId, claimDecision) {
  return knex('Claim').where('ClaimId', claimId)
    .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
    .first('Eligibility.EligibilityId', 'Eligibility.Reference')
    .then(function (result) {
      var eligibilityId = result.EligibilityId
      var reference = result.Reference
      var decision = claimDecision.decision
      var reason = claimDecision.reason
      var note = claimDecision.note

      return Promise.all([updateEligibility(eligibilityId, decision),
        updateClaim(claimId, decision, reason, note),
        updateClaimExpenses(claimDecision.claimExpenseResponses),
        sendClaimNotification(reference, eligibilityId, claimId, decision)])
    })
}

function updateEligibility (eligibilityId, decision) {
  return knex('Eligibility').where('EligibilityId', eligibilityId).update('Status', decision)
}

function updateClaim (claimId, decision, reason, note) {
  return knex('Claim').where('ClaimId', claimId).update({
    'Status': decision,
    'Reason': reason,
    'Note': note
  })
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
