const EnumHelper = require('../../../../app/constants/helpers/enum-helper')
const BenefitsEnum = require('../../../../app/constants/benefits-enum')

describe('constants/helpers/enum-helper', () => {
  const VALID_VALUE = BenefitsEnum.INCOME_SUPPORT.value
  const INVALID_VALUE = 'some invalid value'

  it('should return the enumerated object whose value equals the value given', () => {
    const result = EnumHelper.getKeyByValue(BenefitsEnum, VALID_VALUE)
    expect(result).toBe(BenefitsEnum.INCOME_SUPPORT)
  })

  it('should return the given value if no match was found.', () => {
    const result = EnumHelper.getKeyByValue(BenefitsEnum, INVALID_VALUE)
    expect(result).toBe(INVALID_VALUE)
  })

  it('should return the given value if the value given was not an object.', () => {
    const result = EnumHelper.getKeyByValue(BenefitsEnum, null)
    expect(result).toBeNull()
  })
})
