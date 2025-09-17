const BenefitExpiryDate = require('../../../../app/services/domain/benefit-expiry-date')
const ValidationError = require('../../../../app/services/errors/validation-error')
const dateFormatter = require('../../../../app/services/date-formatter')

let benefitExpiryDate

describe('services/domain/benefit-expiry-date', () => {
  const VALID_DAY = '10'
  const VALID_MONTH = '01'
  const VALID_YEAR = '2020'

  it('should construct a domain object given valid input', () => {
    benefitExpiryDate = new BenefitExpiryDate(VALID_DAY, VALID_MONTH, VALID_YEAR)
    expect(benefitExpiryDate.expiryDate.format('DD-MM-YYYY')).toBe(
      dateFormatter.build(VALID_DAY, VALID_MONTH, VALID_YEAR).format('DD-MM-YYYY'),
    )
  })

  it('should return isRequired error if benefit expiry fields are all empty', () => {
    try {
      benefitExpiryDate = new BenefitExpiryDate('', '', '')
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError)
      expect(e.validationErrors['benefit-expiry'][0]).toBe('Please enter the benefit expiry date')
    }
  })

  it('should return isRequired error if the benefit expiry month field contains and invalid value', () => {
    try {
      benefitExpiryDate = new BenefitExpiryDate('01', '13', '2020')
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError)
      expect(e.validationErrors['benefit-expiry'][0]).toBe('Benefit expiry date was invalid')
    }
  })
})
