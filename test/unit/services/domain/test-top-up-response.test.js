const TopUpResponse = require('../../../../app/services/domain/topup-response')
const ValidationError = require('../../../../app/services/errors/validation-error')

let topUp

describe('services/domain/topup-response', () => {
  const VALID_AMOUNT = '140.85'
  const VALID_REASON = 'This is a test'

  it('should construct a domain object given valid input', () => {
    topUp = new TopUpResponse(VALID_AMOUNT, VALID_REASON)
    expect(topUp.amount).toBe(VALID_AMOUNT)
    expect(topUp.reason).toBe(VALID_REASON)
  })

  it('should return isRequired error for amount if top up amount is empty', () => {
    try {
      topUp = new TopUpResponse('', VALID_REASON)
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError)
      expect(e.validationErrors['top-up-amount'][0]).toBe('A top-up amount is required')
    }
  })

  it('should return isRequired error for reason if top up reason is empty', () => {
    try {
      topUp = new TopUpResponse(VALID_AMOUNT, '')
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError)
      expect(e.validationErrors['top-up-reason'][0]).toBe('A top-up reason is required')
    }
  })

  it('should return greaterThanZero error for amount if top up amount is less than 0', () => {
    try {
      topUp = new TopUpResponse('-10', VALID_REASON)
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError)
      expect(e.validationErrors['top-up-amount'][0]).toBe('A top-up amount must be greater than zero')
    }
  })

  it('should return greaterThanZero error for amount if top up amount is 0', () => {
    try {
      topUp = new TopUpResponse('0', VALID_REASON)
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError)
      expect(e.validationErrors['top-up-amount'][0]).toBe('A top-up amount must be greater than zero')
    }
  })

  it('should return isCurrency error for amount if top up amount is an invalid currency', () => {
    try {
      topUp = new TopUpResponse('10e3', VALID_REASON)
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError)
      expect(e.validationErrors['top-up-amount'][0]).toBe('A top-up amount must be a valid currency')
    }
  })

  it('should return isMaxCostOrLess error for amount if top up amount is greater than 99999.99', () => {
    try {
      topUp = new TopUpResponse('1000000', VALID_REASON)
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError)
      expect(e.validationErrors['top-up-amount'][0]).toBe('A top-up amount value is too large for this field')
    }
  })
})
