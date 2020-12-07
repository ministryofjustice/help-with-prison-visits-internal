const AutoApprovalConfig = require('../../../../app/services/domain/auto-approval-config')
const ValidationError = require('../../../../app/services/errors/validation-error')
const expect = require('chai').expect
let autoApprovalConfig

describe('services/domain/auto-approve-config', function () {
  const VALID_CASEWORKER = 'test@test.com'
  const VALID_AUTO_APPROVAL_ENABLED = 'true'
  const VALID_COST_VARIANCE_PERCENTAGE = '0.1'
  const VALID_MAX_CLAIM_TOTAL = '250'
  const VALID_MAX_DAYS_AFTER_APVU_VISIT = '28'
  const VALID_MAX_NUMBER_OF_CLAIMS_PER_YEAR = '26'
  const VALID_MAX_NUMBER_OF_CLAIMS_PER_MONTH = '4'
  const VALID_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS = '4'
  const VALID_RULES_DISABLED = ['visit-in-the-past', 'first-time-claim-approved']

  it('should contruct a domain object given valid input', function () {
    autoApprovalConfig = new AutoApprovalConfig(
      VALID_CASEWORKER,
      VALID_AUTO_APPROVAL_ENABLED,
      VALID_COST_VARIANCE_PERCENTAGE,
      VALID_MAX_CLAIM_TOTAL,
      VALID_MAX_DAYS_AFTER_APVU_VISIT,
      VALID_MAX_NUMBER_OF_CLAIMS_PER_YEAR,
      VALID_MAX_NUMBER_OF_CLAIMS_PER_MONTH,
      VALID_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS,
      VALID_RULES_DISABLED
    )

    expect(autoApprovalConfig.caseworker).to.equal(VALID_CASEWORKER)
    expect(autoApprovalConfig.autoApprovalEnabled).to.equal(VALID_AUTO_APPROVAL_ENABLED)
    expect(autoApprovalConfig.costVariancePercentage).to.equal(VALID_COST_VARIANCE_PERCENTAGE)
    expect(autoApprovalConfig.maxClaimTotal).to.equal(VALID_MAX_CLAIM_TOTAL)
    expect(autoApprovalConfig.maxDaysAfterAPVUVisit).to.equal(VALID_MAX_DAYS_AFTER_APVU_VISIT)
    expect(autoApprovalConfig.maxNumberOfClaimsPerYear).to.equal(VALID_MAX_NUMBER_OF_CLAIMS_PER_YEAR)
    expect(autoApprovalConfig.maxNumberOfClaimsPerMonth).to.equal(VALID_MAX_NUMBER_OF_CLAIMS_PER_MONTH)
    expect(autoApprovalConfig.numberOfConsecutiveAutoApprovals).to.equal(VALID_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS)
    expect(autoApprovalConfig.rulesDisabled).to.equal(VALID_RULES_DISABLED)
  })

  it('should throw an isRequired error for autoApprovalEnabled given undefined', function () {
    try {
      autoApprovalConfig = new AutoApprovalConfig(
        VALID_CASEWORKER,
        undefined,
        VALID_COST_VARIANCE_PERCENTAGE,
        VALID_MAX_CLAIM_TOTAL,
        VALID_MAX_DAYS_AFTER_APVU_VISIT,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_YEAR,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_MONTH,
        VALID_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS,
        VALID_RULES_DISABLED
      )
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['auto-approval-enabled'][0]).to.equal('Auto approval enabled is required')
    }
  })

  it('should throw an isRequired error for costVariancePercentage given an empty string', function () {
    try {
      autoApprovalConfig = new AutoApprovalConfig(
        VALID_CASEWORKER,
        VALID_AUTO_APPROVAL_ENABLED,
        '',
        VALID_MAX_CLAIM_TOTAL,
        VALID_MAX_DAYS_AFTER_APVU_VISIT,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_YEAR,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_MONTH,
        VALID_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS,
        VALID_RULES_DISABLED
      )
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['cost-variance-percentage'][0]).to.equal('Auto approval cost variance is required')
    }
  })

  it('should throw an isNumeric error for costVariancePercentage given an alpha input', function () {
    try {
      autoApprovalConfig = new AutoApprovalConfig(
        VALID_CASEWORKER,
        VALID_AUTO_APPROVAL_ENABLED,
        'invalid input',
        VALID_MAX_CLAIM_TOTAL,
        VALID_MAX_DAYS_AFTER_APVU_VISIT,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_YEAR,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_MONTH,
        VALID_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS,
        VALID_RULES_DISABLED
      )
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['cost-variance-percentage'][0]).to.equal('Auto approval cost variance must only contain numbers')
    }
  })

  it('should throw an isGreaterThanZero error for costVariancePercentage given 0 as input', function () {
    try {
      autoApprovalConfig = new AutoApprovalConfig(
        VALID_CASEWORKER,
        VALID_AUTO_APPROVAL_ENABLED,
        '0',
        VALID_MAX_CLAIM_TOTAL,
        VALID_MAX_DAYS_AFTER_APVU_VISIT,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_YEAR,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_MONTH,
        VALID_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS,
        VALID_RULES_DISABLED
      )
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['cost-variance-percentage'][0]).to.equal('Auto approval cost variance must be greater than zero')
    }
  })

  it('should throw an isRequired error for maxClaimTotal given an empty string', function () {
    try {
      autoApprovalConfig = new AutoApprovalConfig(
        VALID_CASEWORKER,
        VALID_AUTO_APPROVAL_ENABLED,
        VALID_COST_VARIANCE_PERCENTAGE,
        '',
        VALID_MAX_DAYS_AFTER_APVU_VISIT,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_YEAR,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_MONTH,
        VALID_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS,
        VALID_RULES_DISABLED
      )
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['max-claim-total'][0]).to.equal('Max claim total is required')
    }
  })

  it('should throw an isNumeric error for maxClaimTotal given an alpha input', function () {
    try {
      autoApprovalConfig = new AutoApprovalConfig(
        VALID_CASEWORKER,
        VALID_AUTO_APPROVAL_ENABLED,
        VALID_COST_VARIANCE_PERCENTAGE,
        'invalid input',
        VALID_MAX_DAYS_AFTER_APVU_VISIT,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_YEAR,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_MONTH,
        VALID_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS,
        VALID_RULES_DISABLED
      )
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['max-claim-total'][0]).to.equal('Max claim total must only contain numbers')
    }
  })

  it('should throw an isGreaterThanZero error for maxClaimTotal given 0 as input', function () {
    try {
      autoApprovalConfig = new AutoApprovalConfig(
        VALID_CASEWORKER,
        VALID_AUTO_APPROVAL_ENABLED,
        VALID_COST_VARIANCE_PERCENTAGE,
        '0',
        VALID_MAX_DAYS_AFTER_APVU_VISIT,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_YEAR,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_MONTH,
        VALID_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS,
        VALID_RULES_DISABLED
      )
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['max-claim-total'][0]).to.equal('Max claim total must be greater than zero')
    }
  })

  it('should throw an isRequired error for maxDaysAfterAPVUVisit given an empty string', function () {
    try {
      autoApprovalConfig = new AutoApprovalConfig(
        VALID_CASEWORKER,
        VALID_AUTO_APPROVAL_ENABLED,
        VALID_COST_VARIANCE_PERCENTAGE,
        VALID_MAX_CLAIM_TOTAL,
        '',
        VALID_MAX_NUMBER_OF_CLAIMS_PER_YEAR,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_MONTH,
        VALID_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS,
        VALID_RULES_DISABLED
      )
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['max-days-after-apvu-visit'][0]).to.equal('Max days after APVU visit is required')
    }
  })

  it('should throw an isNumeric error for maxDaysAfterAPVUVisit given an alpha input', function () {
    try {
      autoApprovalConfig = new AutoApprovalConfig(
        VALID_CASEWORKER,
        VALID_AUTO_APPROVAL_ENABLED,
        VALID_COST_VARIANCE_PERCENTAGE,
        VALID_MAX_CLAIM_TOTAL,
        'invalid input',
        VALID_MAX_NUMBER_OF_CLAIMS_PER_YEAR,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_MONTH,
        VALID_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS,
        VALID_RULES_DISABLED
      )
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['max-days-after-apvu-visit'][0]).to.equal('Max days after APVU visit must only contain numbers')
    }
  })

  it('should throw an isGreaterThanZero error for maxDaysAfterAPVUVisit given 0 as input', function () {
    try {
      autoApprovalConfig = new AutoApprovalConfig(
        VALID_CASEWORKER,
        VALID_AUTO_APPROVAL_ENABLED,
        VALID_COST_VARIANCE_PERCENTAGE,
        VALID_MAX_CLAIM_TOTAL,
        '0',
        VALID_MAX_NUMBER_OF_CLAIMS_PER_YEAR,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_MONTH,
        VALID_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS,
        VALID_RULES_DISABLED
      )
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['max-days-after-apvu-visit'][0]).to.equal('Max days after APVU visit must be greater than zero')
    }
  })

  it('should throw an isRequired error for maxNumberOfClaimsPerYear given an empty string', function () {
    try {
      autoApprovalConfig = new AutoApprovalConfig(
        VALID_CASEWORKER,
        VALID_AUTO_APPROVAL_ENABLED,
        VALID_COST_VARIANCE_PERCENTAGE,
        VALID_MAX_CLAIM_TOTAL,
        VALID_MAX_DAYS_AFTER_APVU_VISIT,
        '',
        VALID_MAX_NUMBER_OF_CLAIMS_PER_MONTH,
        VALID_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS,
        VALID_RULES_DISABLED
      )
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['max-number-of-claims-per-year'][0]).to.equal('Max number of claims per year is required')
    }
  })

  it('should throw an isRequired error for maxNumberOfClaimsPerMonth given an empty string', function () {
    try {
      autoApprovalConfig = new AutoApprovalConfig(
        VALID_CASEWORKER,
        VALID_AUTO_APPROVAL_ENABLED,
        VALID_COST_VARIANCE_PERCENTAGE,
        VALID_MAX_CLAIM_TOTAL,
        VALID_MAX_DAYS_AFTER_APVU_VISIT,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_YEAR,
        '',
        VALID_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS,
        VALID_RULES_DISABLED
      )
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['max-number-of-claims-per-month'][0]).to.equal('Max number of claims per month is required')
    }
  })

  it('should throw an isRequired error for numberOfConsecutiveAutoApprovals given an empty string', function () {
    try {
      autoApprovalConfig = new AutoApprovalConfig(
        VALID_CASEWORKER,
        VALID_AUTO_APPROVAL_ENABLED,
        VALID_COST_VARIANCE_PERCENTAGE,
        VALID_MAX_CLAIM_TOTAL,
        VALID_MAX_DAYS_AFTER_APVU_VISIT,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_YEAR,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_MONTH,
        '',
        VALID_RULES_DISABLED
      )
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['number-of-consecutive-auto-approvals'][0]).to.equal('Number of consecutive auto approvals is required')
    }
  })

  it('should throw an isNumeric error for maxNumberOfClaimsPerYear given an alpha input', function () {
    try {
      autoApprovalConfig = new AutoApprovalConfig(
        VALID_CASEWORKER,
        VALID_AUTO_APPROVAL_ENABLED,
        VALID_COST_VARIANCE_PERCENTAGE,
        VALID_MAX_CLAIM_TOTAL,
        VALID_MAX_DAYS_AFTER_APVU_VISIT,
        'invalid input',
        VALID_MAX_NUMBER_OF_CLAIMS_PER_MONTH,
        VALID_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS,
        VALID_RULES_DISABLED
      )
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['max-number-of-claims-per-year'][0]).to.equal('Max number of claims per year must only contain numbers')
    }
  })

  it('should throw an isNumeric error for maxNumberOfClaimsPerMonth given an alpha input', function () {
    try {
      autoApprovalConfig = new AutoApprovalConfig(
        VALID_CASEWORKER,
        VALID_AUTO_APPROVAL_ENABLED,
        VALID_COST_VARIANCE_PERCENTAGE,
        VALID_MAX_CLAIM_TOTAL,
        VALID_MAX_DAYS_AFTER_APVU_VISIT,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_YEAR,
        'invalid input',
        VALID_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS,
        VALID_RULES_DISABLED
      )
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['max-number-of-claims-per-month'][0]).to.equal('Max number of claims per month must only contain numbers')
    }
  })

  it('should throw an isNumeric error for numberOfConsecutiveAutoApprovals given an alpha input', function () {
    try {
      autoApprovalConfig = new AutoApprovalConfig(
        VALID_CASEWORKER,
        VALID_AUTO_APPROVAL_ENABLED,
        VALID_COST_VARIANCE_PERCENTAGE,
        VALID_MAX_CLAIM_TOTAL,
        VALID_MAX_DAYS_AFTER_APVU_VISIT,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_YEAR,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_MONTH,
        'invalid input',
        VALID_RULES_DISABLED
      )
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['number-of-consecutive-auto-approvals'][0]).to.equal('Number of consecutive auto approvals must only contain numbers')
    }
  })

  it('should throw an isGreaterThanZero error for maxNumberOfClaimsPerYear given a 0 as input', function () {
    try {
      autoApprovalConfig = new AutoApprovalConfig(
        VALID_CASEWORKER,
        VALID_AUTO_APPROVAL_ENABLED,
        VALID_COST_VARIANCE_PERCENTAGE,
        VALID_MAX_CLAIM_TOTAL,
        VALID_MAX_DAYS_AFTER_APVU_VISIT,
        '0',
        VALID_MAX_NUMBER_OF_CLAIMS_PER_MONTH,
        VALID_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS,
        VALID_RULES_DISABLED
      )
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['max-number-of-claims-per-year'][0]).to.equal('Max number of claims per year must be greater than zero')
    }
  })

  it('should throw an isGreaterThanZero error for maxNumberOfClaimsPerMonth given 0 as input', function () {
    try {
      autoApprovalConfig = new AutoApprovalConfig(
        VALID_CASEWORKER,
        VALID_AUTO_APPROVAL_ENABLED,
        VALID_COST_VARIANCE_PERCENTAGE,
        VALID_MAX_CLAIM_TOTAL,
        VALID_MAX_DAYS_AFTER_APVU_VISIT,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_YEAR,
        '0',
        VALID_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS,
        VALID_RULES_DISABLED
      )
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['max-number-of-claims-per-month'][0]).to.equal('Max number of claims per month must be greater than zero')
    }
  })

  it('should throw an isGreaterThanZero error for numberOfConsecutiveAutoApprovals given 0 as input', function () {
    try {
      autoApprovalConfig = new AutoApprovalConfig(
        VALID_CASEWORKER,
        VALID_AUTO_APPROVAL_ENABLED,
        VALID_COST_VARIANCE_PERCENTAGE,
        VALID_MAX_CLAIM_TOTAL,
        VALID_MAX_DAYS_AFTER_APVU_VISIT,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_YEAR,
        VALID_MAX_NUMBER_OF_CLAIMS_PER_MONTH,
        '0',
        VALID_RULES_DISABLED
      )
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['number-of-consecutive-auto-approvals'][0]).to.equal('Number of consecutive auto approvals must be greater than zero')
    }
  })
})
