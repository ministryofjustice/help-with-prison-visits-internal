const expect = require('chai').expect

const displayHelper = require('../../../../app/views/helpers/display-helper')
const prisonsEnum = require('../../../../app/constants/prisons-enum')
const benefitsEnum = require('../../../../app/constants/benefits-enum')
const claimStatusEnum = require('../../../../app/constants/claim-status-enum')
const claimTypeEnum = require('../../../../app/constants/claim-type-enum')
const deductionTypeEnum = require('../../../../app/constants/deduction-type-enum')
const claimEventEnum = require('../../../../app/constants/claim-event-enum')
const rulesEnum = require('../../../../app/constants/region-rules-enum')
const dateFormatter = require('../../../../app/services/date-formatter')

describe('views/helpers/display-helper', function () {
  const VALID_BENEFIT_VALUE = benefitsEnum.INCOME_SUPPORT.value
  const VALID_PRISON_VALUE = prisonsEnum.ALTCOURSE.value
  const VALID_CLAIM_TYPE_VALUE = claimTypeEnum.FIRST_TIME.value
  const VALID_DEDUCTION_TYPE_VALUE = deductionTypeEnum.HC3_DEDUCTION.value
  const VALID_REGION_RULES_VALUE = rulesEnum.NI.value
  const VALID_CLAIM_EVENT_VALUE = claimEventEnum.FORCED_MANUAL_CHECK.value
  const INVALID_PRISON_VALUE = 'testing'

  const CLOSED_CLAIM_STATUS_VALUE = claimStatusEnum.APPROVED.value
  const NOT_CLOSED_CLAIM_STATUS_VALUE = claimStatusEnum.NEW.value

  const ADVANCE_UPDATED_CLAIM_STATUS_VALUE = claimStatusEnum.UPDATED.value
  const IS_ADVANCE_CLAIM = true
  const DATE_OF_JOURNEY_PAST = dateFormatter.now().toDate()
  const FUTURE_DATE_OF_JOURNEY = dateFormatter.now().add('2', 'days').toDate()

  it('should return the correct benefit display name given a valid value', function () {
    const result = displayHelper.getBenefitDisplayName(VALID_BENEFIT_VALUE)
    expect(result).to.equal(benefitsEnum.INCOME_SUPPORT.displayName)
  })

  it('should return the correct require benefit upload value given a valid input', function () {
    const result = displayHelper.getBenefitRequireUpload(VALID_BENEFIT_VALUE)
    expect(result).to.equal(benefitsEnum.INCOME_SUPPORT.requireBenefitUpload)
  })

  it('should return the correct benefit multipage value given a valid input', function () {
    const result = displayHelper.getBenefitMultipage(VALID_BENEFIT_VALUE)
    expect(result).to.equal(benefitsEnum.INCOME_SUPPORT.multipage)
  })

  it('should return the correct prison display name given a valid value', function () {
    const result = displayHelper.getPrisonDisplayName(VALID_PRISON_VALUE)
    expect(result).to.equal(prisonsEnum.ALTCOURSE.displayName)
  })

  it('should return the value given if prison not found', function () {
    const result = displayHelper.getPrisonDisplayName(INVALID_PRISON_VALUE)
    expect(result).to.equal(INVALID_PRISON_VALUE)
  })

  it('should return the correct rules given the country value', function () {
    const result = displayHelper.getRegionRulesByValue(VALID_REGION_RULES_VALUE)
    expect(result).to.equal(rulesEnum.NI.rules)
  })

  it('should return the correct prison region given a valid value', function () {
    const result = displayHelper.getPrisonRegion(VALID_PRISON_VALUE)
    expect(result).to.equal(prisonsEnum.ALTCOURSE.region)
  })

  it('should return the correct claim type display name given a valid value', function () {
    const result = displayHelper.getClaimTypeDisplayName(VALID_CLAIM_TYPE_VALUE)
    expect(result).to.equal(claimTypeEnum.FIRST_TIME.displayName)
  })

  it('should return the correct deduction type display name given a valid value', function () {
    const result = displayHelper.getDeductionTypeDisplayName(VALID_DEDUCTION_TYPE_VALUE)
    expect(result).to.equal(deductionTypeEnum.HC3_DEDUCTION.displayName)
  })

  it('should return the correct claim event display name given a valid value', function () {
    const result = displayHelper.getClaimEventDisplayName(VALID_CLAIM_EVENT_VALUE)
    expect(result).to.equal(claimEventEnum.FORCED_MANUAL_CHECK.displayName)
  })

  it('should return the correct closed value given a valid claim status', function () {
    expect(displayHelper.getClaimStatusClosed(CLOSED_CLAIM_STATUS_VALUE)).to.be.true //eslint-disable-line
    expect(displayHelper.getClaimStatusClosed(NOT_CLOSED_CLAIM_STATUS_VALUE)).to.be.false //eslint-disable-line
  })

  it('should return the correct closed value given a valid advance updated claim status and date of journey', function () {
    expect(displayHelper.getClaimStatusClosed(ADVANCE_UPDATED_CLAIM_STATUS_VALUE, IS_ADVANCE_CLAIM, DATE_OF_JOURNEY_PAST)).to.be.true //eslint-disable-line
    expect(displayHelper.getClaimStatusClosed(ADVANCE_UPDATED_CLAIM_STATUS_VALUE, IS_ADVANCE_CLAIM, FUTURE_DATE_OF_JOURNEY)).to.be.false //eslint-disable-line
  })

  it('should return the correct value given a valid integer or decimal number', function () {
    expect(displayHelper.toDecimal(50)).to.equal('50.00')
    expect(displayHelper.toDecimal('21.5')).to.equal('21.50')
  })
})
