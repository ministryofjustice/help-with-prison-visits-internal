const expect = require('chai').expect

const displayHelper = require('../../../../app/views/helpers/display-helper')
const prisonsEnum = require('../../../../app/constants/prisons-enum')
const benefitsEnum = require('../../../../app/constants/benefits-enum')
const claimStatusEnum = require('../../../../app/constants/claim-status-enum')
const claimTypeEnum = require('../../../../app/constants/claim-type-enum')
const deductionTypeEnum = require('../../../../app/constants/deduction-type-enum')

describe('views/helpers/display-helper', function () {
  const VALID_BENEFIT_VALUE = benefitsEnum.INCOME_SUPPORT.value
  const VALID_PRISON_VALUE = prisonsEnum.ALTCOURSE.value
  const VALID_CLAIM_TYPE_VALUE = claimTypeEnum.FIRST_TIME.value
  const VALID_DEDUCTION_TYPE_VALUE = deductionTypeEnum.HC3_DEDUCTION.value

  const CLOSED_CLAIM_STATUS_VALUE = claimStatusEnum.APPROVED.value
  const NOT_CLOSED_CLAIM_STATUS_VALUE = claimStatusEnum.NEW.value

  it('should return the correct benefit display name given a valid value', function () {
    var result = displayHelper.getBenefitDisplayName(VALID_BENEFIT_VALUE)
    expect(result).to.equal(benefitsEnum.INCOME_SUPPORT.displayName)
  })

  it('should return the correct require benefit upload value given a valid input', function () {
    var result = displayHelper.getBenefitRequireUpload(VALID_BENEFIT_VALUE)
    expect(result).to.equal(benefitsEnum.INCOME_SUPPORT.requireBenefitUpload)
  })

  it('should return the correct benefit multipage value given a valid input', function () {
    var result = displayHelper.getBenefitMultipage(VALID_BENEFIT_VALUE)
    expect(result).to.equal(benefitsEnum.INCOME_SUPPORT.multipage)
  })

  it('should return the correct prison display name given a valid value', function () {
    var result = displayHelper.getPrisonDisplayName(VALID_PRISON_VALUE)
    expect(result).to.equal(prisonsEnum.ALTCOURSE.displayName)
  })

  it('should return the correct prison region given a valid value', function () {
    var result = displayHelper.getPrisonRegion(VALID_PRISON_VALUE)
    expect(result).to.equal(prisonsEnum.ALTCOURSE.region)
  })

  it('should return the correct claim type display name given a valid value', function () {
    var result = displayHelper.getClaimTypeDisplayName(VALID_CLAIM_TYPE_VALUE)
    expect(result).to.equal(claimTypeEnum.FIRST_TIME.displayName)
  })

  it('should return the correct deduction type display name given a valid value', function () {
    var result = displayHelper.getDeductionTypeDisplayName(VALID_DEDUCTION_TYPE_VALUE)
    expect(result).to.equal(deductionTypeEnum.HC3_DEDUCTION.displayName)
  })

  it('should return the correct closed value given a valid claim status', function () {
    expect(displayHelper.getClaimStatusClosed(CLOSED_CLAIM_STATUS_VALUE)).to.be.true
    expect(displayHelper.getClaimStatusClosed(NOT_CLOSED_CLAIM_STATUS_VALUE)).to.be.false
  })

  it('should return the correct currency value given a valid integer or decimal number', function () {
    expect(displayHelper.toCurrency(50)).to.equal('£50.00')
    expect(displayHelper.toCurrency('21.5')).to.equal('£21.50')
    expect(displayHelper.toCurrency(-40)).to.equal('-£40.00')
    expect(displayHelper.toCurrency('-32.4')).to.equal('-£32.40')
  })
})
