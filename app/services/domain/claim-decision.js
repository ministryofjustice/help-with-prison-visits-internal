const ValidationError = require('../errors/validation-error')
const FieldValidator = require('../validators/field-validator')
const ErrorHandler = require('../validators/error-handler')
const ERROR_MESSAGES = require('../validators/validation-error-messages')
const claimDecisionEnum = require('../../constants/claim-decision-enum')
const dateFormatter = require('../date-formatter')

let noteId

class ClaimDecision {
  constructor (caseworker,
    assistedDigitalCaseworker,
    decision,
    additionalInfoApprove,
    additionalInfoRequest,
    additionalInfoReject,
    nomisCheck,
    dwpCheck,
    visitConfirmationCheck,
    claimExpenseResponses,
    claimDeductionResponses,
    isAdvanceClaim,
    rejectionReasonId,
    additionalInfoRejectManual,
    expiryDay,
    expiryMonth,
    expiryYear,
    releaseDateIsSet,
    releaseDay,
    releaseMonth,
    releaseYear) {
    this.caseworker = caseworker
    this.assistedDigitalCaseworker = assistedDigitalCaseworker
    this.rejectionReasonId = null
    this.decision = decision
    if (this.decision === claimDecisionEnum.APPROVED) {
      this.note = additionalInfoApprove
      noteId = 'additional-info-approve'
    } else if (decision === claimDecisionEnum.REJECTED) {
      this.rejectionReasonId = rejectionReasonId
      this.note = additionalInfoReject
      noteId = 'additional-info-reject'
      if (additionalInfoReject === 'Other') {
        this.note = additionalInfoRejectManual
        noteId = 'additional-info-reject-manual'
      }
    } else {
      this.note = additionalInfoRequest
      noteId = 'additional-info-request'
    }
    this.nomisCheck = nomisCheck
    this.dwpCheck = dwpCheck
    this.visitConfirmationCheck = visitConfirmationCheck

    this.claimExpenseResponses = claimExpenseResponses
    claimExpenseResponses.forEach(function (expense) {
      if (expense.status === claimDecisionEnum.APPROVED) {
        expense.approvedCost = Number(expense.cost).toFixed(2)
      } else if (expense.status !== claimDecisionEnum.APPROVED_DIFF_AMOUNT) {
        expense.approvedCost = null
      }
    })
    this.claimDeductionResponses = claimDeductionResponses
    this.isAdvanceClaim = isAdvanceClaim
    this.expiryDateFields = [
      expiryDay,
      expiryMonth,
      expiryYear
    ]
    this.expiryDate = dateFormatter.build(expiryDay, expiryMonth, expiryYear)
    if (releaseDateIsSet) {
      this.releaseDateIsSet = true
    } else {
      this.releaseDateIsSet = false
    }
    this.releaseDateFields = [
      releaseDay,
      releaseMonth,
      releaseYear
    ]
    this.releaseDate = dateFormatter.build(releaseDay, releaseMonth, releaseYear)
    this.IsValid()
  }

  IsValid () {
    const errors = ErrorHandler()

    if (this.caseworker === this.assistedDigitalCaseworker) {
      throw new ValidationError({ 'assisted-digital-caseworker': [ERROR_MESSAGES.getAssistedDigitalCaseworkerSameClaim] })
    }

    FieldValidator(this.decision, 'decision', errors)
      .isRequired()

    if (this.decision !== claimDecisionEnum.APPROVED) {
      FieldValidator(this.note, noteId, errors)
        .isRequired(ERROR_MESSAGES.getAdditionalInformationRequired)
    }

    if (this.note) {
      FieldValidator(this.note, noteId, errors)
        .isLessThanLength(2000)
    }

    this.claimExpenseResponses.forEach(function (expense) {
      FieldValidator(expense.status, 'claim-expenses', errors)
        .isRequired(ERROR_MESSAGES.getExpenseCheckRequired)

      if (expense.approvedCost != null) {
        FieldValidator(expense.approvedCost, 'approved-cost', errors)
          .isRequired()
          .isCurrency()
          .isGreaterThanZero()
          .isLessThanMaximumDifferentApprovedAmount()
      }
    })

    let totalExpenseCost = 0.00
    let allExpensesRejected = true
    this.claimExpenseResponses.forEach(function (expense) {
      if (expense.status !== claimDecisionEnum.REJECTED) {
        allExpensesRejected = false
      }

      if (expense.approvedCost) {
        totalExpenseCost += parseFloat(expense.approvedCost)
      }
    })

    if (this.decision === claimDecisionEnum.APPROVED && allExpensesRejected) {
      errors.add('claim-expenses', ERROR_MESSAGES.getNonRejectedClaimExpenseResponse)
    }

    let totalDeductionCost = 0.00
    this.claimDeductionResponses.forEach(function (deduction) {
      totalDeductionCost += parseFloat(deduction.Amount)
    })

    let total = 0.00
    total = totalExpenseCost - totalDeductionCost

    if (this.decision === claimDecisionEnum.APPROVED) {
      FieldValidator(total, 'total-approved-cost', errors)
        .isGreaterThanMinimumClaim()
    }

    FieldValidator(this.nomisCheck, 'nomis-check', errors)
      .isRequired(ERROR_MESSAGES.getPrisonerCheckRequired)

    FieldValidator(this.dwpCheck, 'dwp-check', errors)
      .isRequired(ERROR_MESSAGES.getBenefitCheckRequired)

    if (!this.isAdvanceClaim) {
      FieldValidator(this.visitConfirmationCheck, 'visit-confirmation-check', errors)
        .isRequired(ERROR_MESSAGES.getVisitConfirmationRequired)
    }

    FieldValidator(this.expiryDateFields, 'benefit-expiry', errors)
      .isDateRequired(ERROR_MESSAGES.getExpiryDateIsRequired)
      .isValidDate(this.expiryDate)

    if (this.releaseDateIsSet) {
      FieldValidator(this.releaseDateFields, 'release-date-section', errors)
        .isDateRequired(ERROR_MESSAGES.getReleaseDateIsRequired)
        .isValidDate(this.releaseDate)
        .isFutureDate(this.releaseDate)
    }

    const validationErrors = errors.get()

    if (validationErrors) {
      throw new ValidationError(validationErrors)
    }
  }
}

module.exports = ClaimDecision
