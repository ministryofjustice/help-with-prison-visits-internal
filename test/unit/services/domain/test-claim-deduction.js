const ClaimDeduction = require('../../../../app/services/domain/claim-deduction')
const ValidationError = require('../../../../app/services/errors/validation-error')
const deductionTypeEnum = require('../../../../app/constants/deduction-type-enum')
let claimDeduction

describe('services/domain/claim-deduction', function () {
  const VALID_DEDUCTION_TYPE = deductionTypeEnum.HC3_DEDUCTION
  const VALID_AMOUNT = '10'

  it('should construct a domain object given valid input', function () {
    claimDeduction = new ClaimDeduction(VALID_DEDUCTION_TYPE, VALID_AMOUNT)
    expect(claimDeduction.deductionType).toBe(VALID_DEDUCTION_TYPE)
    expect(claimDeduction.amount).toBe(VALID_AMOUNT)
  })

  it('should return isRequired error for decision if deductionType is empty', function () {
    try {
      claimDeduction = new ClaimDeduction('', VALID_AMOUNT)
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError)
      expect(e.validationErrors.deductionType[0]).toBe('A deduction type is required')
    }
  })

  it('should return isRequired error for decision if amount is empty or zero', function () {
    try {
      claimDeduction = new ClaimDeduction(VALID_DEDUCTION_TYPE, '')
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError)
      expect(e.validationErrors.deductionAmount[0]).toBe('A deduction amount is required')
    }
  })
})
