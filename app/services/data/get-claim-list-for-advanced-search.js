const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const moment = require('moment')
const claimStatusEnum = require('../../../app/constants/claim-status-enum')
const rulesEnum = require('../../../app/constants/region-rules-enum')
const dateFormatter = require('../date-formatter')
const statusFormatter = require('../claim-status-formatter')

const APPROVED_STATUS_VALUES = [ claimStatusEnum.APPROVED.value, claimStatusEnum.APPROVED_ADVANCE_CLOSED.value, claimStatusEnum.APPROVED_PAYOUT_BARCODE_EXPIRED.value, claimStatusEnum.AUTOAPPROVED.value ]
const IN_PROGRESS_STATUS_VALUES = [ claimStatusEnum.UPDATED.value, claimStatusEnum.REQUEST_INFORMATION.value, claimStatusEnum.REQUEST_INFO_PAYMENT.value ]

var countQuery
var selectQuery
var selectFields

var validSearchOptions = [
  'reference',
  'name',
  'ninumber',
  'prisonerNumber',
  'prison',
  'assistedDigital',
  'claimStatus',
  'modeOfApproval',
  'pastOrFuture',
  'visitRules',
  'visitDateFrom',
  'visitDateTo',
  'dateSubmittedFrom',
  'dateSubmittedTo',
  'dateApprovedFrom',
  'dateApprovedTo',
  'dateRejectedFrom',
  'dateRejectedTo',
  'approvedClaimAmountFrom',
  'approvedClaimAmountTo',
  'paymentMethod'
]

const ADVANCED_SEARCH_FIELDS = [
  'Claim.Reference',
  'Visitor.FirstName',
  'Visitor.LastName',
  'Claim.DateSubmitted',
  'Claim.DateOfJourney',
  'Claim.ClaimType',
  'Claim.ClaimId',
  'Claim.AssignedTo',
  'Claim.AssignmentExpiry',
  'Claim.Status',
  'Claim.LastUpdated',
  'ClaimRejectionReason.RejectionReason'
]
const EXPORT_CLAIMS_FIELDS = [
  'Visitor.FirstName',
  'Visitor.LastName',
  'Visitor.Benefit',
  'Visitor.Relationship',
  'Claim.DateSubmitted',
  'Claim.DateOfJourney',
  'Claim.DateReviewed',
  'Claim.ClaimType',
  'Claim.AssistedDigitalCaseworker',
  'Claim.Caseworker',
  'Claim.IsAdvanceClaim',
  'Claim.Status',
  'Claim.PaymentAmount',
  'Claim.ManuallyProcessedAmount',
  'Claim.PaymentMethod',
  'Claim.ClaimId',
  'Claim.LastUpdated',
  'Eligibility.IsTrusted',
  'Prisoner.NameOfPrison',
  'ClaimRejectionReason.RejectionReason',
  'Claim.Note'
]

module.exports = function (searchCriteria, offset, limit, isExport) {
  if (isExport) {
    selectFields = EXPORT_CLAIMS_FIELDS
  } else {
    selectFields = ADVANCED_SEARCH_FIELDS
  }

  var validSearchOptionFound = false

  for (var option in searchCriteria) {
    if (validSearchOptions.indexOf(option) !== -1) {
      if (searchCriteria[option]) {
        validSearchOptionFound = true
      }
    }
  }

  if (!validSearchOptionFound) {
    return Promise.resolve({
      claims: [],
      total: 0
    })
  }

  createBaseQueries(limit, offset)

  if (searchCriteria.reference) {
    applyReferenceFilter(countQuery, searchCriteria.reference)
    applyReferenceFilter(selectQuery, searchCriteria.reference)
  }

  if (searchCriteria.name) {
    applyNameFilter(countQuery, searchCriteria.name)
    applyNameFilter(selectQuery, searchCriteria.name)
  }

  if (searchCriteria.ninumber) {
    applyNINumberFilter(countQuery, searchCriteria.ninumber)
    applyNINumberFilter(selectQuery, searchCriteria.ninumber)
  }

  if (searchCriteria.prisonerNumber) {
    applyPrisonerNumberFilter(countQuery, searchCriteria.prisonerNumber)
    applyPrisonerNumberFilter(selectQuery, searchCriteria.prisonerNumber)
  }

  if (searchCriteria.prison) {
    applyPrisonFilter(countQuery, searchCriteria.prison)
    applyPrisonFilter(selectQuery, searchCriteria.prison)
  }

  if (searchCriteria.assistedDigital) {
    applyAssistedDigitalFilter(countQuery)
    applyAssistedDigitalFilter(selectQuery)
  }

  if (searchCriteria.claimStatus && searchCriteria.claimStatus !== 'all') {
    if (searchCriteria.claimStatus === 'paid') {
      applyPaidClaimStatusFilter(countQuery)
      applyPaidClaimStatusFilter(selectQuery)
    } else if (searchCriteria.claimStatus === 'inProgress') {
      applyInProgressClaimStatusFilter(countQuery)
      applyInProgressClaimStatusFilter(selectQuery)
    } else {
      applyClaimStatusFilter(countQuery, searchCriteria.claimStatus)
      applyClaimStatusFilter(selectQuery, searchCriteria.claimStatus)
    }
  }

  if (searchCriteria.modeOfApproval) {
    applyModeOfApprovalFilter(countQuery, searchCriteria.modeOfApproval)
    applyModeOfApprovalFilter(selectQuery, searchCriteria.modeOfApproval)
  }

  if (searchCriteria.pastOrFuture) {
    applyPastOrFutureFilter(countQuery, searchCriteria.pastOrFuture)
    applyPastOrFutureFilter(selectQuery, searchCriteria.pastOrFuture)
  }

  if (searchCriteria.visitRules) {
    applyVisitRulesFilter(countQuery, searchCriteria.visitRules)
    applyVisitRulesFilter(selectQuery, searchCriteria.visitRules)
  }

  if (searchCriteria.visitDateFrom) {
    applyVisitDateFromFilter(countQuery, searchCriteria.visitDateFrom)
    applyVisitDateFromFilter(selectQuery, searchCriteria.visitDateFrom)
  }

  if (searchCriteria.visitDateTo) {
    applyVisitDateToFilter(countQuery, searchCriteria.visitDateTo)
    applyVisitDateToFilter(selectQuery, searchCriteria.visitDateTo)
  }

  if (searchCriteria.dateSubmittedFrom) {
    applyDateSubmittedFromFilter(countQuery, searchCriteria.dateSubmittedFrom)
    applyDateSubmittedFromFilter(selectQuery, searchCriteria.dateSubmittedFrom)
  }

  if (searchCriteria.dateSubmittedTo) {
    applyDateSubmittedToFilter(countQuery, searchCriteria.dateSubmittedTo)
    applyDateSubmittedToFilter(selectQuery, searchCriteria.dateSubmittedTo)
  }

  if (searchCriteria.dateApprovedFrom) {
    applyDateApprovedFromFilter(countQuery, searchCriteria.dateApprovedFrom)
    applyDateApprovedFromFilter(selectQuery, searchCriteria.dateApprovedFrom)
  }

  if (searchCriteria.dateApprovedTo) {
    applyDateApprovedToFilter(countQuery, searchCriteria.dateApprovedTo)
    applyDateApprovedToFilter(selectQuery, searchCriteria.dateApprovedTo)
  }

  if (searchCriteria.dateRejectedFrom) {
    applyDateRejectedFromFilter(countQuery, searchCriteria.dateRejectedFrom)
    applyDateRejectedFromFilter(selectQuery, searchCriteria.dateRejectedFrom)
  }

  if (searchCriteria.dateRejectedTo) {
    applyDateRejectedToFilter(countQuery, searchCriteria.dateRejectedTo)
    applyDateRejectedToFilter(selectQuery, searchCriteria.dateRejectedTo)
  }

  if (searchCriteria.approvedClaimAmountFrom) {
    applyApprovedClaimAmountFromFilter(countQuery, searchCriteria.approvedClaimAmountFrom)
    applyApprovedClaimAmountFromFilter(selectQuery, searchCriteria.approvedClaimAmountFrom)
  }

  if (searchCriteria.approvedClaimAmountTo) {
    applyApprovedClaimAmountToFilter(countQuery, searchCriteria.approvedClaimAmountTo)
    applyApprovedClaimAmountToFilter(selectQuery, searchCriteria.approvedClaimAmountTo)
  }

  if (searchCriteria.paymentMethod) {
    applyPaymentMethodFilter(countQuery, searchCriteria.paymentMethod)
    applyPaymentMethodFilter(selectQuery, searchCriteria.paymentMethod)
  }

  return countQuery
    .then(function (count) {
      return selectQuery
        .then(function (claims) {
          claims.forEach(function (claim) {
            claim.DateSubmittedFormatted = moment(claim.DateSubmitted).format('DD/MM/YYYY - HH:mm')
            claim.DateOfJourneyFormatted = moment(claim.DateOfJourney).format('DD/MM/YYYY')
            claim.DisplayStatus = statusFormatter(claim.Status)
            claim.Name = claim.FirstName + ' ' + claim.LastName
            if (claim.AssignedTo && claim.AssignmentExpiry < dateFormatter.now().toDate()) {
              claim.AssignedTo = null
            }
            claim.AssignedTo = !claim.AssignedTo ? 'Unassigned' : claim.AssignedTo
          })
          return {
            claims: claims,
            total: count[0]
          }
        })
    })

  function applyReferenceFilter (query, reference) {
    query.where('Claim.Reference', 'like', `%${reference}%`)
  }

  function applyNameFilter (query, name) {
    query.whereRaw(`CONCAT(Visitor.FirstName, ' ', Visitor.LastName) like ?`, [`%${name}%`])
  }

  function applyNINumberFilter (query, ninumber) {
    query.where('Visitor.NationalInsuranceNumber', 'like', `%${ninumber}%`)
  }

  function applyPrisonerNumberFilter (query, prisonerNumber) {
    query.where('Prisoner.PrisonNumber', 'like', `%${prisonerNumber}%`)
  }

  function applyPrisonFilter (query, prison) {
    query.where('Prisoner.NameOfPrison', 'like', `%${prison}%`)
  }

  function applyAssistedDigitalFilter (query) {
    query.whereNotNull('Claim.AssistedDigitalCaseworker')
  }

  function applyClaimStatusFilter (query, claimStatus) {
    var value = claimStatusEnum[claimStatus] ? claimStatusEnum[claimStatus].value : null
    if (value === claimStatusEnum.APPROVED.value) {
      query.whereIn('Claim.Status', APPROVED_STATUS_VALUES)
    } else {
      query.where('Claim.Status', value)
    }
  }

  function applyInProgressClaimStatusFilter (query) {
    query.whereIn('Claim.Status', IN_PROGRESS_STATUS_VALUES)
  }

  function applyPaidClaimStatusFilter (query) {
    query.where(function () {
      this.where('Claim.PaymentStatus', 'PROCESSED')
        .orWhere(function () {
          this.where({
            'Claim.IsAdvanceClaim': true,
            'Claim.Status': claimStatusEnum.APPROVED_ADVANCE_CLOSED.value
          })
        })
    })
  }

  function applyModeOfApprovalFilter (query, modeOfApproval) {
    modeOfApproval = claimStatusEnum[modeOfApproval] ? claimStatusEnum[modeOfApproval].value : null
    query.where('Claim.Status', modeOfApproval)
  }

  function applyPastOrFutureFilter (query, pastOrFuture) {
    if (pastOrFuture === 'past') {
      query.where('Claim.IsAdvanceClaim', 'false')
    } else {
      query.where('Claim.IsAdvanceClaim', 'true')
    }
  }

  function applyVisitRulesFilter (query, visitRules) {
    if (visitRules === 'englandWales') {
      query.whereIn('Visitor.Country', [rulesEnum.ENGLAND.value, rulesEnum.WALES.value])
    } else if (visitRules === 'scotland') {
      query.where('Visitor.Country', rulesEnum.SCOTLAND.value)
    } else if (visitRules === 'northernIreland') {
      query.where('Visitor.Country', rulesEnum.NI.value)
    }
  }

  function applyVisitDateFromFilter (query, visitDateFrom) {
    query.where('Claim.DateOfJourney', '>=', visitDateFrom)
  }

  function applyVisitDateToFilter (query, visitDateTo) {
    query.where('Claim.DateOfJourney', '<=', visitDateTo)
  }

  function applyDateSubmittedFromFilter (query, dateSubmittedFrom) {
    query.where('Claim.DateSubmitted', '>=', dateSubmittedFrom)
  }

  function applyDateSubmittedToFilter (query, dateSubmittedTo) {
    query.where('Claim.DateSubmitted', '<=', dateSubmittedTo)
  }

  function applyDateApprovedFromFilter (query, dateApprovedFrom) {
    query.where('Claim.DateReviewed', '>=', dateApprovedFrom)
      .whereIn('Claim.Status', APPROVED_STATUS_VALUES)
  }

  function applyDateApprovedToFilter (query, dateApprovedTo) {
    query.where('Claim.DateReviewed', '<=', dateApprovedTo)
      .whereIn('Claim.Status', APPROVED_STATUS_VALUES)
  }

  function applyDateRejectedFromFilter (query, dateRejectedFrom) {
    query.where('Claim.DateReviewed', '>=', dateRejectedFrom)
      .where('Claim.Status', claimStatusEnum.REJECTED.value)
  }

  function applyDateRejectedToFilter (query, dateRejectedTo) {
    query.where('Claim.DateReviewed', '<=', dateRejectedTo)
      .where('Claim.Status', claimStatusEnum.REJECTED.value)
  }

  function applyApprovedClaimAmountFromFilter (query, approvedClaimAmountFrom) {
    query.where('Claim.PaymentAmount', '>=', approvedClaimAmountFrom)
      .whereIn('Claim.Status', APPROVED_STATUS_VALUES)
  }

  function applyApprovedClaimAmountToFilter (query, approvedClaimAmountTo) {
    query.where('Claim.PaymentAmount', '<=', approvedClaimAmountTo)
      .whereIn('Claim.Status', APPROVED_STATUS_VALUES)
  }

  function applyPaymentMethodFilter (query, paymentMethod) {
    query.where('Claim.PaymentMethod', paymentMethod)
  }

  function createBaseQueries (limit, offset) {
    countQuery = knex('Claim')
      .join('Visitor', 'Claim.EligibilityId', '=', 'Visitor.EligibilityId')
      .join('Prisoner', 'Claim.EligibilityId', '=', 'Prisoner.EligibilityId')
      .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
      .leftJoin('ClaimRejectionReason', 'Claim.RejectionReasonId', '=', 'ClaimRejectionReason.ClaimRejectionReasonId')
      .count('Claim.ClaimId AS Count')

    selectQuery = knex('Claim')
      .join('Visitor', 'Claim.EligibilityId', '=', 'Visitor.EligibilityId')
      .join('Prisoner', 'Claim.EligibilityId', '=', 'Prisoner.EligibilityId')
      .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
      .leftJoin('ClaimRejectionReason', 'Claim.RejectionReasonId', '=', 'ClaimRejectionReason.ClaimRejectionReasonId')
      .select(selectFields)
      .orderBy('Claim.DateSubmitted', 'asc')
      .limit(limit)
      .offset(offset)
  }
}
