const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const dateFormatter = require('../date-formatter')
const displayHelper = require('../../views/helpers/display-helper')

const insertClaimEvent = require('./insert-claim-event')
const overpaymentActionEnum = require('../../constants/overpayment-action-enum')

const newLine = '<br >'

module.exports = function (claim, overpaymentResponse) {
  var eventLabel = overpaymentResponse.action
  var note = overpaymentResponse.reason
  var toBeMarkedAsOverpaid = overpaymentResponse.action === overpaymentActionEnum.OVERPAID
  var toBeResolved = overpaymentResponse.action === overpaymentActionEnum.RESOLVE
  var toBeUpdated = overpaymentResponse.action === overpaymentActionEnum.UPDATE

  var updateClaim = {
    IsOverpaid: toBeMarkedAsOverpaid || toBeUpdated,
    LastUpdated: dateFormatter.now().toDate()
  }

  if (toBeMarkedAsOverpaid) {
    updateClaim.OverpaymentAmount = overpaymentResponse.amount
    updateClaim.RemainingOverpaymentAmount = overpaymentResponse.amount
    updateClaim.OverpaymentReason = overpaymentResponse.reason
    if (updateClaim.OverpaymentReason > 250) {
      updateClaim.OverpaymentReason = updateClaim.OverpaymentReason.substring(0, 250)
    }
  } else if (toBeResolved) {
    updateClaim.RemainingOverpaymentAmount = overpaymentResponse.remaining
  } else if (toBeUpdated) {
    note = buildUpdateNote(claim.RemainingOverpaymentAmount, overpaymentResponse.remaining, overpaymentResponse.reason)

    updateClaim.RemainingOverpaymentAmount = overpaymentResponse.remaining
  }

  return knex('Claim')
    .where('ClaimId', claim.ClaimId)
    .update(updateClaim)
    .then(function () {
      return insertClaimEvent(claim.Reference, claim.EligibilityId, claim.ClaimId, eventLabel, null, note, null, true)
    })
}

function buildUpdateNote (previousRemainingAmount, newRemainingAmount, note) {
  var result = []
  result.push(note)
  result.push(`Previous remaining amount: £${displayHelper.toDecimal(previousRemainingAmount)}`)
  result.push(`New remaining amount: £${displayHelper.toDecimal(newRemainingAmount)}`)

  return result.join(newLine)
}
