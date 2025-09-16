const { getDatabaseConnector } = require('../../databaseConnector')
const dateFormatter = require('../date-formatter')
const displayHelper = require('../../views/helpers/display-helper')
const insertClaimEvent = require('./insert-claim-event')
const overpaymentActionEnum = require('../../constants/overpayment-action-enum')

const newLine = '<br >'

module.exports = (claim, overpaymentResponse) => {
  const db = getDatabaseConnector()

  const eventLabel = overpaymentResponse.action
  let note = overpaymentResponse.reason
  const toBeMarkedAsOverpaid = overpaymentResponse.action === overpaymentActionEnum.OVERPAID
  const toBeResolved = overpaymentResponse.action === overpaymentActionEnum.RESOLVE
  const toBeUpdated = overpaymentResponse.action === overpaymentActionEnum.UPDATE

  const updateClaim = {
    IsOverpaid: toBeMarkedAsOverpaid || toBeUpdated,
    LastUpdated: dateFormatter.now().toDate(),
  }

  if (toBeMarkedAsOverpaid) {
    updateClaim.OverpaymentAmount = overpaymentResponse.amount
    updateClaim.RemainingOverpaymentAmount = overpaymentResponse.amount
    updateClaim.OverpaymentReason = overpaymentResponse.reason
  } else if (toBeResolved) {
    updateClaim.RemainingOverpaymentAmount = overpaymentResponse.remaining
  } else if (toBeUpdated) {
    note = buildUpdateNote(claim.RemainingOverpaymentAmount, overpaymentResponse.remaining, overpaymentResponse.reason)

    updateClaim.RemainingOverpaymentAmount = overpaymentResponse.remaining
  }

  if (updateClaim.OverpaymentReason > 250) {
    updateClaim.OverpaymentReason = updateClaim.OverpaymentReason.substring(0, 250)
  }

  return db('Claim')
    .where('ClaimId', claim.ClaimId)
    .update(updateClaim)
    .then(() => {
      return insertClaimEvent(claim.Reference, claim.EligibilityId, claim.ClaimId, eventLabel, null, note, null, true)
    })
}

function buildUpdateNote(previousRemainingAmount, newRemainingAmount, note) {
  const result = []
  result.push(note)
  result.push(`Previous remaining amount: £${displayHelper.toDecimal(previousRemainingAmount)}`)
  result.push(`New remaining amount: £${displayHelper.toDecimal(newRemainingAmount)}`)

  return result.join(newLine)
}
