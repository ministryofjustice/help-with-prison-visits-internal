const moment = require('moment')
const { getDatabaseConnector } = require('../../databaseConnector')
const duplicateClaimCheck = require('./duplicate-claim-check')
const duplicateBankDetailsCheck = require('./duplicate-bank-details-check')
const getClaimsForPrisonNumberAndVisitDate = require('./get-claims-for-prison-number-and-visit-date')
const getClaimTotalAmount = require('../get-claim-total-amount')
const getOverpaidClaimsByReference = require('./get-overpaid-claims-by-reference')
const claimDecisionEnum = require('../../constants/claim-decision-enum')
const topUpStatusEnum = require('../../constants/top-up-status-enum')
const dateFormatter = require('../date-formatter')

module.exports = claimId => {
  let claim
  let claimEligibleChild
  let claimDocumentData
  let claimExpenses
  let claimChildren
  let claimEscort
  let claimDeductions
  let claimDuplicatesExist
  let claimantDuplicates
  let claimDetails
  let claimEvents
  let overpaidClaimData
  let reference
  let topUps
  let latestUnpaidTopUp
  let bankDuplicates

  return getClaimantDetails(claimId)
    .then(claimData => {
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
        getClaimsForPrisonNumberAndVisitDate(claimId, claim.PrisonNumber, claim.DateOfJourney),
        getTopUp(claimId),
        getLatestUnpaidTopUp(claimId),
        duplicateBankDetailsCheck(reference, claimData.AccountNumber),
      ])
    })
    .then(results => {
      ;[
        claimEligibleChild,
        claimDocumentData,
        claimExpenses,
        claimDeductions,
        claimChildren,
        claimEscort,
        claimDuplicatesExist,
        claimEvents,
        overpaidClaimData,
        claimantDuplicates,
        topUps,
        latestUnpaidTopUp,
        bankDuplicates,
      ] = results
      claim = appendClaimDocumentsToClaim(claim, claimDocumentData)
      claim.Total = getClaimTotalAmount(claimExpenses, claimDeductions)

      claimDetails = {
        claim,
        claimEligibleChild,
        claimExpenses: setClaimExpenseStatusForCarJourneys(claimExpenses),
        claimChild: claimChildren,
        claimEscort,
        claimEvents,
        deductions: claimDeductions,
        duplicates: claimDuplicatesExist,
        overpaidClaims: overpaidClaimData,
        TopUps: topUps,
        claimantDuplicates,
        latestUnpaidTopUp,
        bankDuplicates,
      }

      return claimDetails
    })
}

function getClaimantDetails(claimId) {
  const db = getDatabaseConnector()

  return db('Claim')
    .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
    .join('Visitor', 'Eligibility.EligibilityId', '=', 'Visitor.EligibilityId')
    .join('Prisoner', 'Eligibility.EligibilityId', '=', 'Prisoner.EligibilityId')
    .leftJoin('Benefit', 'Eligibility.EligibilityId', '=', 'Benefit.EligibilityId')
    .leftJoin('ClaimBankDetail', 'Claim.ClaimId', '=', 'ClaimBankDetail.ClaimId')
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
      'Claim.PaymentStatus',
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
      'Visitor.BenefitExpiryDate',
      'Prisoner.FirstName AS PrisonerFirstName',
      'Prisoner.LastName AS PrisonerLastName',
      'Prisoner.DateOfBirth AS PrisonerDateOfBirth',
      'Prisoner.PrisonNumber',
      'Prisoner.NameOfPrison',
      'Prisoner.NomisCheck',
      'Prisoner.ReleaseDateIsSet',
      'Prisoner.ReleaseDate',
      'Benefit.FirstName AS BenefitOwnerFirstName',
      'Benefit.LastName AS BenefitOwnerLastName',
      'Benefit.DateOfBirth AS BenefitOwnerDateOfBirth',
      'Benefit.NationalInsuranceNumber AS BenefitOwnerNationalInsuranceNumber',
      'ClaimBankDetail.AccountNumber',
      'ClaimBankDetail.NameOnAccount',
    )
    .then(data => {
      if (data.AssignedTo && data.AssignmentExpiry < dateFormatter.now().toDate()) {
        data.AssignedTo = null
      }
      return data
    })
}

function getClaimEligibleChild(reference, eligibilityId) {
  const db = getDatabaseConnector()

  return db('EligibleChild')
    .where({ 'EligibleChild.Reference': reference, 'EligibleChild.EligibilityId': eligibilityId })
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
      'EligibleChild.Country',
    )
}

function getClaimDocuments(claimId, reference, eligibilityId) {
  const db = getDatabaseConnector()

  return db('ClaimDocument')
    .where({ 'ClaimDocument.ClaimId': claimId, 'ClaimDocument.IsEnabled': true, 'ClaimDocument.ClaimExpenseId': null })
    .orWhere({
      'ClaimDocument.ClaimId': null,
      'ClaimDocument.Reference': reference,
      'ClaimDocument.EligibilityId': eligibilityId,
      'ClaimDocument.IsEnabled': true,
      'ClaimDocument.ClaimExpenseId': null,
    })
    .select(
      'ClaimDocument.ClaimDocumentId',
      'ClaimDocument.DocumentStatus',
      'ClaimDocument.Filepath',
      'ClaimDocument.DocumentType',
    )
    .orderBy('ClaimDocument.DateSubmitted', 'desc')
}

function getClaimExpenses(claimId) {
  const db = getDatabaseConnector()

  return db('Claim')
    .join('ClaimExpense', 'Claim.ClaimId', '=', 'ClaimExpense.ClaimId')
    .where('Claim.ClaimId', claimId)
    .select(
      'ClaimExpense.*',
      'ClaimDocument.DocumentStatus',
      'ClaimDocument.DocumentType',
      'ClaimDocument.ClaimDocumentId',
      'ClaimDocument.Filepath',
    )
    .leftJoin('ClaimDocument', function leftJoinQuery() {
      this.on('ClaimExpense.ClaimId', 'ClaimDocument.ClaimId')
        .on('ClaimExpense.ClaimExpenseId', 'ClaimDocument.ClaimExpenseId')
        .on('ClaimExpense.IsEnabled', 'ClaimDocument.IsEnabled')
    })
    .orderBy('ClaimExpense.ClaimExpenseId')
}

function getClaimDeductions(claimId) {
  const db = getDatabaseConnector()

  return db('ClaimDeduction').where({ ClaimId: claimId, IsEnabled: true })
}

function getClaimChildren(claimId) {
  const db = getDatabaseConnector()

  return db('Claim')
    .join('ClaimChild', 'Claim.ClaimId', '=', 'ClaimChild.ClaimId')
    .where({ 'Claim.ClaimId': claimId, 'ClaimChild.IsEnabled': true })
    .select()
    .orderBy('ClaimChild.FirstName')
}

function getClaimEscort(claimId) {
  const db = getDatabaseConnector()

  return db('ClaimEscort').first().where({ ClaimId: claimId, IsEnabled: true }).select().orderBy('FirstName')
}

function getClaimEvents(claimId) {
  const db = getDatabaseConnector()

  return db('ClaimEvent').where('ClaimId', claimId)
}

function getTopUp(claimId) {
  const db = getDatabaseConnector()

  return db
    .select('TopUpId', 'ClaimId', 'PaymentStatus', 'Caseworker', 'TopUpAmount', 'Reason', 'DateAdded', 'PaymentDate')
    .from('TopUp')
    .where('ClaimId', claimId)
    .then(TopUpResults => {
      let allTopUpsPaid = true
      TopUpResults.forEach(TopUpResult => {
        if (TopUpResult.PaymentStatus === topUpStatusEnum.PENDING) {
          allTopUpsPaid = false
        }
        TopUpResult.TopUpAmount = Number(TopUpResult.TopUpAmount).toFixed(2)
      })
      TopUpResults.allTopUpsPaid = allTopUpsPaid
      return TopUpResults
    })
}

function getLatestUnpaidTopUp(claimId) {
  const db = getDatabaseConnector()

  return db
    .first('TopUpId', 'ClaimId', 'PaymentStatus', 'Caseworker', 'TopUpAmount', 'Reason', 'DateAdded', 'PaymentDate')
    .from('TopUp')
    .where('ClaimId', claimId)
    .where('PaymentStatus', topUpStatusEnum.PENDING)
    .then(latestUnpaidTopUp => {
      if (latestUnpaidTopUp) {
        latestUnpaidTopUp.TopUpAmount = Number(latestUnpaidTopUp.TopUpAmount).toFixed(2)
      }
      return latestUnpaidTopUp
    })
}

function setClaimExpenseStatusForCarJourneys(claimExpenses) {
  claimExpenses.forEach(claimExpense => {
    if (claimExpense.ExpenseType === 'car' && claimExpense.Status === null && claimExpense.Cost === 0) {
      claimExpense.Status = claimDecisionEnum.APPROVED_DIFF_AMOUNT
    }
  })

  return claimExpenses
}

function appendClaimDocumentsToClaim(claim, claimDocuments) {
  claim.benefitDocument = []
  claimDocuments.forEach(document => {
    if (document.DocumentType === 'VISIT-CONFIRMATION') {
      claim.visitConfirmation = document
    } else {
      claim.benefitDocument.push(document)
    }
  })

  return claim
}
