const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const duplicateClaimCheck = require('./duplicate-claim-check')
const getClaimTotalAmount = require('../get-claim-total-amount')
const getOverpaidClaimsByReference = require('./get-overpaid-claims-by-reference')
const moment = require('moment')

module.exports = function (claimId) {
  var claim
  var claimExpenses
  var claimChildren
  var claimEscort
  var claimDeductions
  var claimDuplicatesExist
  var claimDetails
  var claimEvents
  var reference

  return getClaimantDetails(claimId)
    .then(function (claimData) {
      claim = claimData
      reference = claim.Reference
      claim.lastUpdatedHidden = moment(claim.LastUpdated)

      return Promise.all([
        getClaimDocuments(claimId),
        getClaimExpenses(claimId),
        getClaimDeductions(claimId),
        getClaimChildren(claimId),
        getClaimEscort(claimId),
        duplicateClaimCheck(claimId, claim.NationalInsuranceNumber, claim.PrisonNumber, claim.DateOfJourney),
        getClaimEvents(claimId),
        getOverpaidClaimsByReference(reference, claimId)
      ])
    })
    .then(function (results) {
      var claimDocumentData = results[0]
      claimExpenses = results[1]
      claimDeductions = results[2]
      claimChildren = results[3]
      claimEscort = results[4]
      claimDuplicatesExist = results[5]
      claimEvents = results[6]
      var overpaidClaimData = results[7]

      claim = appendClaimDocumentsToClaim(claim, claimDocumentData)
      claim.Total = getClaimTotalAmount(claimExpenses, claimDeductions)

      claimDetails = {
        claim: claim,
        claimExpenses: setClaimExpenseStatusForCarJourneys(claimExpenses),
        claimChild: claimChildren,
        claimEscort: claimEscort,
        claimEvents: claimEvents,
        deductions: claimDeductions,
        duplicates: claimDuplicatesExist,
        overpaidClaims: overpaidClaimData
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
      'Visitor.FirstName',
      'Visitor.LastName',
      'Visitor.DateOfBirth',
      'Visitor.NationalInsuranceNumber',
      'Visitor.HouseNumberAndStreet',
      'Visitor.Town',
      'Visitor.County',
      'Visitor.PostCode',
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
      'Prisoner.NomisCheck')
}

function getClaimDocuments (claimId) {
  return knex('ClaimDocument')
    .where({'ClaimDocument.ClaimId': claimId, 'ClaimDocument.IsEnabled': true, 'ClaimDocument.ClaimExpenseId': null})
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
    .then(function (claimExpenses) {
      claimExpenses.forEach(function (claimExpense) {
        claimExpense.Cost = Number(claimExpense.Cost).toFixed(2)
      })

      return claimExpenses
    })
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
    if (claimExpense.ExpenseType === 'car' && claimExpense.Status === null) {
      claimExpense.Status = 'APPROVED-DIFF-AMOUNT'
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
