const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const dateFormatter = require('../date-formatter')
const claimDecisionEnum = require('../../constants/claim-decision-enum')
const tasksEnum = require('../../constants/tasks-enum')
const paymentMethodEnum = require('../../constants/payment-method-enum')
const insertClaimEvent = require('./insert-claim-event')
const insertTaskSendClaimNotification = require('./insert-task-send-claim-notification')
const updateRelatedClaimRemainingOverpaymentAmount = require('./update-related-claims-remaining-overpayment-amount')
const log = require('../log')

module.exports = function (claimId, claimDecision) {
  return knex('Claim').where('ClaimId', claimId)
    .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
    .first('Eligibility.EligibilityId', 'Eligibility.Reference')
    .then(function (result) {
      var eligibilityId = result.EligibilityId
      var reference = result.Reference
      var caseworker = claimDecision.caseworker
      var decision = claimDecision.decision
      var note = claimDecision.note
      var nomisCheck = claimDecision.nomisCheck
      var dwpCheck = claimDecision.dwpCheck
      var visitConfirmationCheck = claimDecision.visitConfirmationCheck
      var allExpensesManuallyProcessed = areAllExpensesManuallyProcessed(claimDecision.claimExpenseResponses)

      return Promise.all([updateEligibility(eligibilityId, decision),
        updateClaim(claimId, caseworker, decision, note, visitConfirmationCheck, allExpensesManuallyProcessed),
        updateVisitor(eligibilityId, dwpCheck),
        updatePrisoner(eligibilityId, nomisCheck),
        updateClaimExpenses(claimDecision.claimExpenseResponses),
        insertClaimEventForDecision(reference, eligibilityId, claimId, decision, note, caseworker),
        updateRemainingOverpaymentAmounts(claimId, reference, decision),
        sendClaimNotification(reference, eligibilityId, claimId, decision)])
    })
}

function updateEligibility (eligibilityId, decision) {
  return knex('Eligibility').where('EligibilityId', eligibilityId).update('Status', decision)
}

function updateClaim (claimId, caseworker, decision, note, visitConfirmationCheck, allExpensesManuallyProcessed) {
  var updateObject = {}
  if (decision === claimDecisionEnum.APPROVED) {
    updateObject = {
      'Caseworker': caseworker,
      'Status': decision,
      'Note': note,
      'VisitConfirmationCheck': visitConfirmationCheck,
      'DateReviewed': dateFormatter.now().toDate(),
      'AssignedTo': null, // clear assignment
      'AssignmentExpiry': null,
      'LastUpdated': dateFormatter.now().toDate(),
      'DateApproved': dateFormatter.now().toDate()
    }
  } else if (decision === claimDecisionEnum.REJECTED || decision === claimDecisionEnum.REQUEST_INFORMATION) {
    updateObject = {
      'Caseworker': caseworker,
      'Status': decision,
      'Note': note,
      'VisitConfirmationCheck': visitConfirmationCheck,
      'DateReviewed': dateFormatter.now().toDate(),
      'AssignedTo': null, // clear assignment
      'AssignmentExpiry': null,
      'LastUpdated': dateFormatter.now().toDate(),
      'DateApproved': null
    }
  } else {
    updateObject = {
      'Caseworker': caseworker,
      'Status': decision,
      'Note': note,
      'VisitConfirmationCheck': visitConfirmationCheck,
      'DateReviewed': dateFormatter.now().toDate(),
      'AssignedTo': null, // clear assignment
      'AssignmentExpiry': null,
      'LastUpdated': dateFormatter.now().toDate()
    }
  }

  if (allExpensesManuallyProcessed) {
    updateObject.PaymentMethod = paymentMethodEnum.MANUALLY_PROCESSED.value
  }

  return knex('Claim').where('ClaimId', claimId).update(updateObject).then(
    log.info('Claim ID ' + claimId + ' Closed with Status: ' + updateObject.Status)
  )
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

function updateRemainingOverpaymentAmounts (claimId, reference, decision) {
  if (decision === claimDecisionEnum.APPROVED) {
    return updateRelatedClaimRemainingOverpaymentAmount(claimId, reference)
  } else {
    return Promise.resolve(null)
  }
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

function areAllExpensesManuallyProcessed (claimExpenseResponses) {
  var result = true

  claimExpenseResponses.forEach(function (claimExpenseResponse) {
    if (claimExpenseResponse.status !== claimDecisionEnum.MANUALLY_PROCESSED) {
      result = false
    }
  })

  return result
}
