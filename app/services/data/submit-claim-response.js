const { getDatabaseConnector } = require('../../databaseConnector')
const dateFormatter = require('../date-formatter')
const claimDecisionEnum = require('../../constants/claim-decision-enum')
const tasksEnum = require('../../constants/tasks-enum')
const paymentMethodEnum = require('../../constants/payment-method-enum')
const insertClaimEvent = require('./insert-claim-event')
const insertTaskSendClaimNotification = require('./insert-task-send-claim-notification')
const updateRelatedClaimRemainingOverpaymentAmount = require('./update-related-claims-remaining-overpayment-amount')
const log = require('../log')

module.exports = function (claimId, claimDecision) {
  const db = getDatabaseConnector()

  return db('Claim').where('ClaimId', claimId)
    .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
    .first('Eligibility.EligibilityId', 'Eligibility.Reference')
    .then(function (result) {
      const eligibilityId = result.EligibilityId
      const reference = result.Reference
      const caseworker = claimDecision.caseworker
      const decision = claimDecision.decision
      const note = claimDecision.note
      const nomisCheck = claimDecision.nomisCheck
      const releaseDateIsSet = claimDecision.releaseDateIsSet
      let releaseDate = null
      if (claimDecision.releaseDateIsSet) {
        releaseDate = claimDecision.releaseDate.format('YYYY-MM-DD')
      }
      const dwpCheck = claimDecision.dwpCheck
      const visitConfirmationCheck = claimDecision.visitConfirmationCheck
      const rejectionReasonId = claimDecision.rejectionReasonId
      const allExpensesManuallyProcessed = areAllExpensesManuallyProcessed(claimDecision.claimExpenseResponses)
      const expiryDate = claimDecision.expiryDate.format('YYYY-MM-DD')

      return Promise.all([updateEligibility(eligibilityId, decision),
        updateClaim(claimId, caseworker, decision, note, visitConfirmationCheck, allExpensesManuallyProcessed, rejectionReasonId),
        updateVisitor(eligibilityId, dwpCheck, expiryDate),
        updatePrisoner(eligibilityId, nomisCheck, releaseDateIsSet, releaseDate),
        updateClaimExpenses(claimDecision.claimExpenseResponses),
        insertClaimEventForDecision(reference, eligibilityId, claimId, decision, note, caseworker),
        updateRemainingOverpaymentAmounts(claimId, reference, decision),
        sendClaimNotification(reference, eligibilityId, claimId, decision)])
    })
}

function updateEligibility (eligibilityId, decision) {
  const db = getDatabaseConnector()

  return db('Eligibility').where('EligibilityId', eligibilityId).update('Status', decision)
}

function updateClaim (claimId, caseworker, decision, note, visitConfirmationCheck, allExpensesManuallyProcessed, rejectionReasonId) {
  let updateObject = {}
  const db = getDatabaseConnector()

  if (decision === claimDecisionEnum.APPROVED) {
    updateObject = {
      Caseworker: caseworker,
      Status: decision,
      Note: note,
      VisitConfirmationCheck: visitConfirmationCheck,
      DateReviewed: dateFormatter.now().toDate(),
      AssignedTo: null, // clear assignment
      AssignmentExpiry: null,
      LastUpdated: dateFormatter.now().toDate(),
      DateApproved: dateFormatter.now().toDate()
    }
  } else if (decision === claimDecisionEnum.REJECTED || decision === claimDecisionEnum.REQUEST_INFORMATION) {
    updateObject = {
      Caseworker: caseworker,
      Status: decision,
      Note: note,
      VisitConfirmationCheck: visitConfirmationCheck,
      DateReviewed: dateFormatter.now().toDate(),
      AssignedTo: null, // clear assignment
      AssignmentExpiry: null,
      LastUpdated: dateFormatter.now().toDate(),
      DateApproved: null,
      RejectionReasonId: rejectionReasonId
    }
  } else {
    updateObject = {
      Caseworker: caseworker,
      Status: decision,
      Note: note,
      VisitConfirmationCheck: visitConfirmationCheck,
      DateReviewed: dateFormatter.now().toDate(),
      AssignedTo: null, // clear assignment
      AssignmentExpiry: null,
      LastUpdated: dateFormatter.now().toDate()
    }
  }

  if (updateObject.Note.length > 250) {
    updateObject.Note = updateObject.Note.substring(0, 250)
  }

  if (allExpensesManuallyProcessed) {
    updateObject.PaymentMethod = paymentMethodEnum.MANUALLY_PROCESSED.value
  }

  return db('Claim').where('ClaimId', claimId).update(updateObject).then(
    log.info('Claim ID ' + claimId + ' Closed with Status: ' + updateObject.Status)
  )
}

function updateVisitor (eligibilityId, dwpCheck, expiryDate) {
  const db = getDatabaseConnector()

  return db('Visitor').where('EligibilityId', eligibilityId).update({
    DWPCheck: dwpCheck,
    BenefitExpiryDate: expiryDate
  })
}

function updatePrisoner (eligibilityId, nomisCheck, releaseDateIsSet, releaseDate) {
  const db = getDatabaseConnector()

  return db('Prisoner').where('EligibilityId', eligibilityId).update({
    NomisCheck: nomisCheck,
    ReleaseDateIsSet: releaseDateIsSet,
    ReleaseDate: releaseDate
  })
}

function updateClaimExpenses (claimExpenseResponses) {
  const updates = []
  if (claimExpenseResponses) {
    claimExpenseResponses.forEach(function (claimExpenseResponse) {
      updates.push(updateClaimExpense(claimExpenseResponse))
    })
  }
  return Promise.all(updates)
}

function updateClaimExpense (claimExpenseResponse) {
  const db = getDatabaseConnector()

  return db('ClaimExpense').where('ClaimExpenseId', claimExpenseResponse.claimExpenseId).update({
    ApprovedCost: claimExpenseResponse.approvedCost,
    Status: claimExpenseResponse.status
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
  let notificationType
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
  let result = true

  claimExpenseResponses.forEach(function (claimExpenseResponse) {
    if (claimExpenseResponse.status !== claimDecisionEnum.MANUALLY_PROCESSED) {
      result = false
    }
  })

  return result
}
