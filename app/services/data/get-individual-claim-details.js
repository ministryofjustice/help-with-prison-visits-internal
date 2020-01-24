const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const duplicateClaimCheck = require('./duplicate-claim-check')
const getClaimsForPrisonNumberAndVisitDate = require('./get-claims-for-prison-number-and-visit-date')
const getClaimTotalAmount = require('../get-claim-total-amount')
const getOverpaidClaimsByReference = require('./get-overpaid-claims-by-reference')
const claimDecisionEnum = require('../../constants/claim-decision-enum')
const dateFormatter = require('../date-formatter')
const moment = require('moment')
const log = require('../log')

module.exports = function (claimId) {
  var claim
  var claimEligibleChild
  var claimDocumentData
  var claimExpenses
  var claimChildren
  var claimEscort
  var claimDeductions
  var claimDuplicatesExist
  var claimantDuplicates
  var claimDetails
  var claimEvents
  var overpaidClaimData
  var reference

  return getClaimantDetails(claimId)
    .then(function (claimData) {
      claim = claimData
      reference = claim.Reference
      claim.lastUpdatedHidden = moment(claim.LastUpdated)
      return Promise.all([
        getClaimEligibleChild(reference, claim.EligibilityId),
        getClaimDocuments(claimId, reference, claim.EligibilityId),
        getClaimExpenses(claimId),
        getClaimDeductions(claimId),
        getClaimChildren(claimId),
        getClaimEscort(claimId),
        duplicateClaimCheck(claimId, claim.NationalInsuranceNumber, claim.PrisonNumber, claim.DateOfJourney),
        getClaimEvents(claimId),
        getOverpaidClaimsByReference(reference, claimId),
        getClaimsForPrisonNumberAndVisitDate(claimId, claim.PrisonNumber, claim.DateOfJourney)
      ])
    })
    .then(function (results) {
      claimEligibleChild = results[0]
      claimDocumentData = results[1]
      claimExpenses = results[2]
      claimDeductions = results[3]
      claimChildren = results[4]
      claimEscort = results[5]
      claimDuplicatesExist = results[6]
      claimEvents = results[7]
      overpaidClaimData = results[8]
      claimantDuplicates = results[9]

      claim = appendClaimDocumentsToClaim(claim, claimDocumentData)
      claim.Total = getClaimTotalAmount(claimExpenses, claimDeductions)

      claimDetails = {
        claim: claim,
        claimEligibleChild: claimEligibleChild,
        claimExpenses: setClaimExpenseStatusForCarJourneys(claimExpenses),
        claimChild: claimChildren,
        claimEscort: claimEscort,
        claimEvents: claimEvents,
        deductions: claimDeductions,
        duplicates: claimDuplicatesExist,
        overpaidClaims: overpaidClaimData,
        claimantDuplicates: claimantDuplicates
      }

      return claimDetails
    })
}

function getClaimantDetails (claimId) {
  return knex('Claim')
    .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
    .join('Visitor', 'Eligibility.EligibilityId', '=', 'Visitor.EligibilityId')
    .join('Prisoner', 'Eligibility.EligibilityId', '=', 'Prisoner.EligibilityId')
    .where('Claim.ClaimId', claimId)
    .first(
      'Eligibility.Reference',
      'Eligibility.EligibilityId',
      'Eligibility.IsTrusted',
      'Eligibility.UntrustedReason',
      'Eligibility.UntrustedDate',
      'Eligibility.ReferenceDisabled',
      'Eligibility.DisabledReason',
      'Claim.ClaimId',
      'Claim.ClaimType',
      'Claim.IsAdvanceClaim',
      'Claim.IsOverpaid',
      'Claim.OverpaymentAmount',
      'Claim.RemainingOverpaymentAmount',
      'Claim.OverpaymentReason',
      'Claim.DateSubmitted',
      'Claim.DateOfJourney',
      'Claim.AssistedDigitalCaseworker',
      'Claim.Caseworker',
      'Claim.VisitConfirmationCheck',
      'Claim.LastUpdated',
      'Claim.Status',
      'Claim.PaymentMethod',
      'Claim.AssignedTo',
      'Claim.AssignmentExpiry',
      'Visitor.FirstName',
      'Visitor.LastName',
      'Visitor.DateOfBirth',
      'Visitor.NationalInsuranceNumber',
      'Visitor.HouseNumberAndStreet',
      'Visitor.Town',
      'Visitor.County',
      'Visitor.PostCode',
      'Visitor.Country',
      'Visitor.EmailAddress',
      'Visitor.PhoneNumber',
      'Visitor.Relationship',
      'Visitor.Benefit',
      'Visitor.DWPBenefitCheckerResult',
      'Visitor.DWPCheck',
      'Prisoner.FirstName AS PrisonerFirstName',
      'Prisoner.LastName AS PrisonerLastName',
      'Prisoner.DateOfBirth AS PrisonerDateOfBirth',
      'Prisoner.PrisonNumber',
      'Prisoner.NameOfPrison',
      'Prisoner.NomisCheck',
      'Prisoner.ReleaseDateIsSet',
      'Prisoner.ReleaseDate')
    .then(function (data) {
      if (data.AssignedTo && data.AssignmentExpiry < dateFormatter.now().toDate()) {
        data.AssignedTo = null
      }
      return data
    })
}

function getClaimEligibleChild (reference, eligibilityId) {
  return knex('EligibleChild')
    .where({'EligibleChild.Reference': reference, 'EligibleChild.EligibilityId': eligibilityId})
    .select(
      'EligibleChild.FirstName',
      'EligibleChild.LastName',
      'EligibleChild.ChildRelationship',
      'EligibleChild.DateOfBirth',
      'EligibleChild.ParentFirstName',
      'EligibleChild.ParentLastName',
      'EligibleChild.HouseNumberAndStreet',
      'EligibleChild.Town',
      'EligibleChild.County',
      'EligibleChild.PostCode',
      'EligibleChild.Country')
    .first()
}

function getClaimDocuments (claimId, reference, eligibilityId) {
  return knex('ClaimDocument')
    .where({'ClaimDocument.ClaimId': claimId, 'ClaimDocument.IsEnabled': true, 'ClaimDocument.ClaimExpenseId': null})
    .orWhere({
      'ClaimDocument.ClaimId': null,
      'ClaimDocument.Reference': reference,
      'ClaimDocument.EligibilityId': eligibilityId,
      'ClaimDocument.IsEnabled': true,
      'ClaimDocument.ClaimExpenseId': null})
    .select(
      'ClaimDocument.ClaimDocumentId',
      'ClaimDocument.DocumentStatus',
      'ClaimDocument.Filepath',
      'ClaimDocument.DocumentType')
    .orderBy('ClaimDocument.DateSubmitted', 'desc')
}

function getClaimExpenses (claimId) {
  return knex('Claim')
    .join('ClaimExpense', 'Claim.ClaimId', '=', 'ClaimExpense.ClaimId')
    .where('Claim.ClaimId', claimId)
    .select('ClaimExpense.*', 'ClaimDocument.DocumentStatus', 'ClaimDocument.DocumentType', 'ClaimDocument.ClaimDocumentId', 'ClaimDocument.Filepath')
    .leftJoin('ClaimDocument', function () {
      this
        .on('ClaimExpense.ClaimId', 'ClaimDocument.ClaimId')
        .on('ClaimExpense.ClaimExpenseId', 'ClaimDocument.ClaimExpenseId')
        .on('ClaimExpense.IsEnabled', 'ClaimDocument.IsEnabled')
    })
    .orderBy('ClaimExpense.ClaimExpenseId')
}

function getClaimDeductions (claimId) {
  return knex('ClaimDeduction')
    .where({'ClaimId': claimId, 'IsEnabled': true})
}

function getClaimChildren (claimId) {
  return knex('Claim')
    .join('ClaimChild', 'Claim.ClaimId', '=', 'ClaimChild.ClaimId')
    .where({ 'Claim.ClaimId': claimId, 'ClaimChild.IsEnabled': true })
    .select()
    .orderBy('ClaimChild.FirstName')
}

function getClaimEscort (claimId) {
  return knex('ClaimEscort')
    .first()
    .where({ 'ClaimId': claimId, 'IsEnabled': true })
    .select()
    .orderBy('FirstName')
}

function getClaimEvents (claimId) {
  return knex('ClaimEvent')
    .where('ClaimId', claimId)
}

function setClaimExpenseStatusForCarJourneys (claimExpenses) {
  claimExpenses.forEach(function (claimExpense) {
    if (claimExpense.ExpenseType === 'car' && claimExpense.Status === null && claimExpense.Cost === 0) {
      claimExpense.Status = claimDecisionEnum.APPROVED_DIFF_AMOUNT
    }
  })

  return claimExpenses
}

function appendClaimDocumentsToClaim (claim, claimDocuments) {
  claim.benefitDocument = []
  claimDocuments.forEach(function (document) {
    if (document.DocumentType === 'VISIT-CONFIRMATION') {
      claim.visitConfirmation = document
    } else {
      claim.benefitDocument.push(document)
    }
  })

  return claim
}
