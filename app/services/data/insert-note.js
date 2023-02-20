const { getDatabaseConnector } = require('../../databaseConnector')
const dateFormatter = require('../date-formatter')
const insertClaimEvent = require('./insert-claim-event')
const log = require('../log')

module.exports = function (claimId, claimNote, user) {
  const db = getDatabaseConnector()

  return db('Claim').where('ClaimId', claimId)
    .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
    .first('Eligibility.EligibilityId', 'Eligibility.Reference')
    .then(function (result) {
      const eligibilityId = result.EligibilityId
      const reference = result.Reference
      const caseworker = user
      const decision = result.decision
      const note = claimNote

      return Promise.all([updateClaim(claimId, note),
        insertClaimEventForNote(reference, eligibilityId, claimId, decision, note, caseworker)])
    })
}

function updateClaim (claimId, note) {
  let updateObject = {}
  const db = getDatabaseConnector()

  updateObject = {
    Note: note,
    LastUpdated: dateFormatter.now().toDate()
  }

  if (updateObject.Note.length > 250) {
    updateObject.Note = updateObject.Note.substring(0, 250)
  }

  return db('Claim').where('ClaimId', claimId).update(updateObject).then(
    log.info('Claim ID ' + claimId + ' note added: ' + updateObject.Note)
  )
}

function insertClaimEventForNote (reference, eligibilityId, claimId, decision, note, caseworker) {
  const event = 'CLAIM-NOTE'
  log.info(caseworker)
  return insertClaimEvent(reference, eligibilityId, claimId, event, null, note, caseworker, true)
}
