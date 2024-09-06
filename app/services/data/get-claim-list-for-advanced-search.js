const { format, differenceInDays } = require('date-fns')
const { getDatabaseConnector } = require('../../databaseConnector')
const claimStatusEnum = require('../../../app/constants/claim-status-enum')
const rulesEnum = require('../../../app/constants/region-rules-enum')
const dateFormatter = require('../date-formatter')
const statusFormatter = require('../claim-status-formatter')
const getClosedClaimsStatuses = require('./get-closed-claims-statuses')

const APPROVED_STATUS_VALUES = [claimStatusEnum.APPROVED.value, claimStatusEnum.APPROVED_ADVANCE_CLOSED.value, claimStatusEnum.APPROVED_PAYOUT_BARCODE_EXPIRED.value, claimStatusEnum.AUTOAPPROVED.value]
const IN_PROGRESS_STATUS_VALUES = [claimStatusEnum.UPDATED.value, claimStatusEnum.REQUEST_INFORMATION.value, claimStatusEnum.REQUEST_INFO_PAYMENT.value]

const validSearchOptions = [
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
  'overpaymentStatus',
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
  'ClaimRejectionReason.RejectionReason',
  'Claim.PaymentDate'
]
const EXPORT_CLAIMS_FIELDS = [
  'Visitor.FirstName',
  'Visitor.LastName',
  'Visitor.Benefit',
  'Visitor.Relationship',
  'Prisoner.PrisonNumber',
  'Prisoner.DateOfBirth',
  'Claim.Reference',
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
  'Claim.Note',
  'Claim.PaymentDate'
]

function getClaimListForAdvancedSearch (searchCriteria, offset, limit, isExport) {
  let validSearchOptionFound = false

  for (const option in searchCriteria) {
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

  let { countQuery, selectQuery } = createBaseQueries(limit, offset, isExport)

  if (searchCriteria.reference) {
    selectQuery = applyReferenceFilter(selectQuery, searchCriteria.reference)
    countQuery = applyReferenceFilter(countQuery, searchCriteria.reference)
  }

  if (searchCriteria.name) {
    selectQuery = applyNameFilter(selectQuery, searchCriteria.name)
    countQuery = applyNameFilter(countQuery, searchCriteria.name)
  }

  if (searchCriteria.ninumber) {
    selectQuery = applyNINumberFilter(selectQuery, searchCriteria.ninumber)
    countQuery = applyNINumberFilter(countQuery, searchCriteria.ninumber)
  }

  if (searchCriteria.prisonerNumber) {
    selectQuery = applyPrisonerNumberFilter(selectQuery, searchCriteria.prisonerNumber)
    countQuery = applyPrisonerNumberFilter(countQuery, searchCriteria.prisonerNumber)
  }

  if (searchCriteria.prison) {
    selectQuery = applyPrisonFilter(selectQuery, searchCriteria.prison)
    countQuery = applyPrisonFilter(countQuery, searchCriteria.prison)
  }

  if (searchCriteria.assistedDigital) {
    selectQuery = applyAssistedDigitalFilter(selectQuery)
    countQuery = applyAssistedDigitalFilter(countQuery)
  }

  if (searchCriteria.claimStatus && searchCriteria.claimStatus !== 'all') {
    if (searchCriteria.claimStatus === 'paid') {
      selectQuery = applyPaidClaimStatusFilter(selectQuery)
      countQuery = applyPaidClaimStatusFilter(countQuery)
    } else if (searchCriteria.claimStatus === 'inProgress') {
      selectQuery = applyInProgressClaimStatusFilter(selectQuery)
      countQuery = applyInProgressClaimStatusFilter(countQuery)
    } else {
      selectQuery = applyClaimStatusFilter(selectQuery, searchCriteria.claimStatus)
      countQuery = applyClaimStatusFilter(countQuery, searchCriteria.claimStatus)
    }
  }

  if (searchCriteria.modeOfApproval) {
    selectQuery = applyModeOfApprovalFilter(selectQuery, searchCriteria.modeOfApproval)
    countQuery = applyModeOfApprovalFilter(countQuery, searchCriteria.modeOfApproval)
  }

  if (searchCriteria.pastOrFuture) {
    selectQuery = applyPastOrFutureFilter(selectQuery, searchCriteria.pastOrFuture)
    countQuery = applyPastOrFutureFilter(countQuery, searchCriteria.pastOrFuture)
  }

  if (searchCriteria.visitRules) {
    selectQuery = applyVisitRulesFilter(selectQuery, searchCriteria.visitRules)
    countQuery = applyVisitRulesFilter(countQuery, searchCriteria.visitRules)
  }

  if (searchCriteria.overpaymentStatus) {
    selectQuery = applyOverpaymentStatusFilter(selectQuery, searchCriteria.overpaymentStatus)
    countQuery = applyOverpaymentStatusFilter(countQuery, searchCriteria.overpaymentStatus)
  }

  if (searchCriteria.visitDateFrom) {
    selectQuery = applyVisitDateFromFilter(selectQuery, searchCriteria.visitDateFrom)
    countQuery = applyVisitDateFromFilter(countQuery, searchCriteria.visitDateFrom)
  }

  if (searchCriteria.visitDateTo) {
    selectQuery = applyVisitDateToFilter(selectQuery, searchCriteria.visitDateTo)
    countQuery = applyVisitDateToFilter(countQuery, searchCriteria.visitDateTo)
  }

  if (searchCriteria.dateSubmittedFrom) {
    selectQuery = applyDateSubmittedFromFilter(selectQuery, searchCriteria.dateSubmittedFrom)
    countQuery = applyDateSubmittedFromFilter(countQuery, searchCriteria.dateSubmittedFrom)
  }

  if (searchCriteria.dateSubmittedTo) {
    selectQuery = applyDateSubmittedToFilter(selectQuery, searchCriteria.dateSubmittedTo)
    countQuery = applyDateSubmittedToFilter(countQuery, searchCriteria.dateSubmittedTo)
  }

  if (searchCriteria.dateApprovedFrom) {
    selectQuery = applyDateApprovedFromFilter(selectQuery, searchCriteria.dateApprovedFrom)
    countQuery = applyDateApprovedFromFilter(countQuery, searchCriteria.dateApprovedFrom)
  }

  if (searchCriteria.dateApprovedTo) {
    selectQuery = applyDateApprovedToFilter(selectQuery, searchCriteria.dateApprovedTo)
    countQuery = applyDateApprovedToFilter(countQuery, searchCriteria.dateApprovedTo)
  }

  if (searchCriteria.dateRejectedFrom) {
    selectQuery = applyDateRejectedFromFilter(selectQuery, searchCriteria.dateRejectedFrom)
    countQuery = applyDateRejectedFromFilter(countQuery, searchCriteria.dateRejectedFrom)
  }

  if (searchCriteria.dateRejectedTo) {
    selectQuery = applyDateRejectedToFilter(selectQuery, searchCriteria.dateRejectedTo)
    countQuery = applyDateRejectedToFilter(countQuery, searchCriteria.dateRejectedTo)
  }

  if (searchCriteria.approvedClaimAmountFrom) {
    selectQuery = applyApprovedClaimAmountFromFilter(selectQuery, searchCriteria.approvedClaimAmountFrom)
    countQuery = applyApprovedClaimAmountFromFilter(countQuery, searchCriteria.approvedClaimAmountFrom)
  }

  if (searchCriteria.approvedClaimAmountTo) {
    selectQuery = applyApprovedClaimAmountToFilter(selectQuery, searchCriteria.approvedClaimAmountTo)
    countQuery = applyApprovedClaimAmountToFilter(countQuery, searchCriteria.approvedClaimAmountTo)
  }

  if (searchCriteria.paymentMethod) {
    selectQuery = applyPaymentMethodFilter(selectQuery, searchCriteria.paymentMethod)
    countQuery = applyPaymentMethodFilter(countQuery, searchCriteria.paymentMethod)
  }

  return countQuery
    .then(function (count) {
      return selectQuery
        .then(function (claims) {
          const claimIds = claims.reduce(function (currentClaimIds, claim) {
            currentClaimIds.push(claim.ClaimId)

            return currentClaimIds
          }, [])

          return getClosedClaimsStatuses(claimIds)
            .then(function (closedClaimsStatuses) {
              return getClaimsToReturn(closedClaimsStatuses, claims, count[0])
            })
        })
    })

  function applyReferenceFilter (query, reference) {
    return query.where('Claim.Reference', 'like', `%${reference}%`)
  }

  function applyNameFilter (query, name) {
    return query.whereRaw('CONCAT(Visitor.FirstName, \' \', Visitor.LastName) like ?', [`%${name}%`])
  }

  function applyNINumberFilter (query, ninumber) {
    return query.where('Visitor.NationalInsuranceNumber', 'like', `%${ninumber}%`)
  }

  function applyPrisonerNumberFilter (query, prisonerNumber) {
    return query.where('Prisoner.PrisonNumber', 'like', `%${prisonerNumber}%`)
  }

  function applyPrisonFilter (query, prison) {
    return query.where('Prisoner.NameOfPrison', 'like', `%${prison}%`)
  }

  function applyAssistedDigitalFilter (query) {
    return query.whereNotNull('Claim.AssistedDigitalCaseworker')
  }

  function applyClaimStatusFilter (query, claimStatus) {
    const value = claimStatusEnum[claimStatus] ? claimStatusEnum[claimStatus].value : null
    if (value === claimStatusEnum.APPROVED.value) {
      return query.whereIn('Claim.Status', APPROVED_STATUS_VALUES)
    }

    return query.where('Claim.Status', value)
  }

  function applyInProgressClaimStatusFilter (query) {
    return query.whereIn('Claim.Status', IN_PROGRESS_STATUS_VALUES)
  }

  function applyPaidClaimStatusFilter (query) {
    return query.where(function () {
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
    return query.where('Claim.Status', modeOfApproval)
  }

  function applyPastOrFutureFilter (query, pastOrFuture) {
    if (pastOrFuture === 'past') {
      return query.where('Claim.IsAdvanceClaim', 'false')
    }

    return query.where('Claim.IsAdvanceClaim', 'true')
  }

  function applyVisitRulesFilter (query, visitRules) {
    if (visitRules === 'englandWales') {
      return query.whereIn('Visitor.Country', [rulesEnum.ENGLAND.value, rulesEnum.WALES.value])
    } else if (visitRules === 'scotland') {
      return query.where('Visitor.Country', rulesEnum.SCOTLAND.value)
    } else if (visitRules === 'northernIreland') {
      return query.where('Visitor.Country', rulesEnum.NI.value)
    }

    return query
  }

  function applyOverpaymentStatusFilter (query, overpaymentStatus) {
    if (overpaymentStatus === 'false') {
      return query.where(function () {
        this.where('Claim.IsOverpaid', false)
          .orWhereNull('Claim.IsOverpaid')
      })
    }

    return query.orWhere('Claim.IsOverpaid', true)
  }

  function applyVisitDateFromFilter (query, visitDateFrom) {
    return query.where('Claim.DateOfJourney', '>=', visitDateFrom)
  }

  function applyVisitDateToFilter (query, visitDateTo) {
    return query.where('Claim.DateOfJourney', '<=', visitDateTo)
  }

  function applyDateSubmittedFromFilter (query, dateSubmittedFrom) {
    return query.where('Claim.DateSubmitted', '>=', dateSubmittedFrom)
  }

  function applyDateSubmittedToFilter (query, dateSubmittedTo) {
    return query.where('Claim.DateSubmitted', '<=', dateSubmittedTo)
  }

  function applyDateApprovedFromFilter (query, dateApprovedFrom) {
    return query.where('Claim.DateReviewed', '>=', dateApprovedFrom)
      .whereIn('Claim.Status', APPROVED_STATUS_VALUES)
  }

  function applyDateApprovedToFilter (query, dateApprovedTo) {
    return query.where('Claim.DateReviewed', '<=', dateApprovedTo)
      .whereIn('Claim.Status', APPROVED_STATUS_VALUES)
  }

  function applyDateRejectedFromFilter (query, dateRejectedFrom) {
    return query.where('Claim.DateReviewed', '>=', dateRejectedFrom)
      .where('Claim.Status', claimStatusEnum.REJECTED.value)
  }

  function applyDateRejectedToFilter (query, dateRejectedTo) {
    return query.where('Claim.DateReviewed', '<=', dateRejectedTo)
      .where('Claim.Status', claimStatusEnum.REJECTED.value)
  }

  function applyApprovedClaimAmountFromFilter (query, approvedClaimAmountFrom) {
    return query.where('Claim.PaymentAmount', '>=', approvedClaimAmountFrom)
      .whereIn('Claim.Status', APPROVED_STATUS_VALUES)
  }

  function applyApprovedClaimAmountToFilter (query, approvedClaimAmountTo) {
    return query.where('Claim.PaymentAmount', '<=', approvedClaimAmountTo)
      .whereIn('Claim.Status', APPROVED_STATUS_VALUES)
  }

  function applyPaymentMethodFilter (query, paymentMethod) {
    return query.where('Claim.PaymentMethod', paymentMethod)
  }

  async function createBaseQueries (limit, offset, isExport) {
    const selectFields = isExport ? EXPORT_CLAIMS_FIELDS : ADVANCED_SEARCH_FIELDS
    const db = getDatabaseConnector()

    const countQuery = db('Claim')
      .join('Visitor', 'Claim.EligibilityId', '=', 'Visitor.EligibilityId')
      .join('Prisoner', 'Claim.EligibilityId', '=', 'Prisoner.EligibilityId')
      .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
      .leftJoin('ClaimRejectionReason', 'Claim.RejectionReasonId', '=', 'ClaimRejectionReason.ClaimRejectionReasonId')
      .count('Claim.ClaimId AS Count')

    const selectQuery = db('Claim')
      .join('Visitor', 'Claim.EligibilityId', '=', 'Visitor.EligibilityId')
      .join('Prisoner', 'Claim.EligibilityId', '=', 'Prisoner.EligibilityId')
      .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
      .leftJoin('ClaimRejectionReason', 'Claim.RejectionReasonId', '=', 'ClaimRejectionReason.ClaimRejectionReasonId')
      .select(selectFields)
      .orderBy('Claim.DateSubmitted', 'asc')
      .limit(limit)
      .offset(offset)

    return { countQuery, selectQuery }
  }
}

function getClaimsToReturn (closedClaimsStatuses, claims, total) {
  const claimsToReturn = []

  claims.forEach((claim) => {
    claim.DateSubmittedFormatted = format(claim.DateSubmitted, 'dd/MM/yyyy - HH:mm')
    claim.DateOfJourneyFormatted = format(claim.DateOfJourney, 'dd/MM/yyyy')
    claim.DisplayStatus = statusFormatter(claim.Status)
    claim.Name = claim.FirstName + ' ' + claim.LastName

    if (claim.AssignedTo && claim.AssignmentExpiry < dateFormatter.now().toDate()) {
      claim.AssignedTo = null
    }

    claim.AssignedTo = !claim.AssignedTo ? 'Unassigned' : claim.AssignedTo
    claim.DaysUntilPayment = claim.PaymentDate ? differenceInDays(claim.PaymentDate, claim.DateSubmitted) : 'N/A'

    if (claim.Status === claimStatusEnum.APPROVED_ADVANCE_CLOSED.value) {
      const status = closedClaimsStatuses[claim.ClaimId]
      claim.DisplayStatus = 'Closed - ' + statusFormatter(status)
    }

    claimsToReturn.push(claim)
  })

  return {
    claims: claimsToReturn,
    total
  }
}

module.exports = {
  getClaimsToReturn,
  getClaimListForAdvancedSearch
}
