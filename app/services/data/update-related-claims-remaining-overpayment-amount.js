const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const getIndividualClaimDetails = require('./get-individual-claim-details')
const getOverpaidClaimsByReference = require('./get-overpaid-claims-by-reference')
const insertClaimEvent = require('./insert-claim-event')
const deductionTypeEnum = require('../../constants/deduction-type-enum')
const overpaymentActionEnum = require('../../constants/overpayment-action-enum')
const displayHelper = require('../../views/helpers/display-helper')

module.exports = function (currentClaimId, reference) {
  return getIndividualClaimDetails(currentClaimId)
    .then(function (claimDetails) {
      return getOverpaidClaimsByReference(reference, currentClaimId)
        .then(function (overpaidClaims) {
          var deductionTotal = getOverpaymentDeductionTotal(claimDetails.deductions)

          if (deductionTotal > 0 && overpaidClaims.length > 0) {
            return subtractTotalDeductionsFromRemainingOverpayments(overpaidClaims, deductionTotal)
          }
        })
    })
}

function getOverpaymentDeductionTotal (claimDeductions) {
  var total = 0
  claimDeductions.forEach(function (claimDeduction) {
    if (claimDeduction.DeductionType === deductionTypeEnum.OVERPAYMENT.value) {
      total += claimDeduction.Amount
    }
  })

  return total
}

function subtractTotalDeductionsFromRemainingOverpayments (overpaidClaims, deductionTotal) {
  var deductionsToBeSubtracted = deductionTotal
  var index = 0
  var updates = []

  while (deductionsToBeSubtracted > 0 && index < overpaidClaims.length) {
    var overpaidClaim = overpaidClaims[index]
    var currentRemainingOverpaymentAmount = overpaidClaim.RemainingOverpaymentAmount
    var newRemainingBalance = currentRemainingOverpaymentAmount - deductionsToBeSubtracted
    var amountToBeDeductedFromClaim = newRemainingBalance - currentRemainingOverpaymentAmount

    if (newRemainingBalance < 0) {
      deductionsToBeSubtracted = newRemainingBalance * -1
      newRemainingBalance = 0
    } else {
      deductionsToBeSubtracted = deductionsToBeSubtracted - newRemainingBalance
    }

    var isOverpaid = newRemainingBalance > 0

    updates.push(updateRemainingOverpaymentAmount(overpaidClaim, newRemainingBalance, amountToBeDeductedFromClaim.toFixed(2), isOverpaid))
    index++
  }

  return Promise.all(updates)
}

function updateRemainingOverpaymentAmount (claim, newRemainingOverpaymentAmount, deductionAmount, isOverpaid) {
  var updatedClaim = {
    ClaimId: claim.ClaimId,
    RemainingOverpaymentAmount: newRemainingOverpaymentAmount,
    IsOverpaid: isOverpaid
  }

  var eventLabel = isOverpaid ? overpaymentActionEnum.UPDATE : overpaymentActionEnum.RESOLVE
  var note = `Deduction of ${displayHelper.toCurrency(deductionAmount)} applied on related claim`

  return knex('Claim').where('ClaimId', claim.ClaimId).update(updatedClaim)
    .then(function () {
      return insertClaimEvent(claim.Reference, claim.EligibilityId, claim.ClaimId, eventLabel, null, note, null, true)
    })
}
