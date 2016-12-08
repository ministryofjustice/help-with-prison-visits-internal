const ValidationError = require('../errors/validation-error')
const FieldValidator = require('../validators/field-validator')
const ErrorHandler = require('../validators/error-handler')

class AutoApprovalConfig {
  constructor (
    caseworker,
    autoApprovalEnabled,
    costVariancePercentage,
    maxClaimTotal,
    maxDaysAfterAPVUVisit,
    maxNumberOfClaimsPerYear,
    rulesDisabled
  ) {
    this.caseworker = caseworker
    this.autoApprovalEnabled = autoApprovalEnabled || ''
    this.costVariancePercentage = costVariancePercentage || ''
    this.maxClaimTotal = maxClaimTotal || ''
    this.maxDaysAfterAPVUVisit = maxDaysAfterAPVUVisit || ''
    this.maxNumberOfClaimsPerYear = maxNumberOfClaimsPerYear || ''
    this.rulesDisabled = rulesDisabled.length > 0 ? rulesDisabled : null

    this.IsValid()
  }

  IsValid () {
    var errors = ErrorHandler()

    FieldValidator(this.autoApprovalEnabled, 'auto-approval-enabled', errors)
      .isRequired()

    FieldValidator(this.costVariancePercentage, 'cost-variance-percentage', errors)
      .isRequired()
      .isNumeric()

    FieldValidator(this.maxClaimTotal, 'max-claim-total', errors)
      .isRequired()
      .isNumeric()

    FieldValidator(this.maxDaysAfterAPVUVisit, 'max-days-after-apvu-visit', errors)
      .isRequired()
      .isNumeric()

    FieldValidator(this.maxNumberOfClaimsPerYear, 'max-number-of-claims-per-year', errors)
      .isRequired()
      .isNumeric()

    var validationErrors = errors.get()

    if (validationErrors) {
      throw new ValidationError(validationErrors)
    }
  }
}

module.exports = AutoApprovalConfig
