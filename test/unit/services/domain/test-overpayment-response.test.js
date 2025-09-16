const OverpaymentResponse = require('../../../../app/services/domain/overpayment-response')
const ValidationError = require('../../../../app/services/errors/validation-error')
const overpaymentActionEnum = require('../../../../app/constants/overpayment-action-enum')

let overpaymentResponse

describe('services/domain/overpayment-response', () => {
  const IS_OVERPAID = true
  const IS_NOT_OVERPAID = false
  const OVERPAYMENT_AMOUNT = '10'
  const OVERPAYMENT_REMAINING = '5'
  const REASON = 'reason'

  it('should construct a domain object given valid input', () => {
    overpaymentResponse = new OverpaymentResponse(OVERPAYMENT_AMOUNT, OVERPAYMENT_REMAINING, REASON, IS_OVERPAID)
    expect(overpaymentResponse.action).not.toBeNull()
    expect(overpaymentResponse.amount).toBe(OVERPAYMENT_AMOUNT)
    expect(overpaymentResponse.remaining).toBe(OVERPAYMENT_REMAINING)
    expect(overpaymentResponse.reason).toBe(REASON)
  })

  it('should throw validation error if overpayment remaining value doesnt exist', () => {
    try {
      overpaymentResponse = new OverpaymentResponse(OVERPAYMENT_AMOUNT, '', REASON, IS_OVERPAID)
      expect.fail()
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError)
      expect(e.validationErrors['overpayment-remaining']).toContain('The remaining overpayment amount is required')
    }
  })

  it('should not throw validation error if overpayment remaining value is zero', () => {
    try {
      overpaymentResponse = new OverpaymentResponse(OVERPAYMENT_AMOUNT, '0', REASON, IS_OVERPAID)
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError)
      expect.fail('Validation error thrown')
    }
  })

  it('should throw validation error if overpayment remaining value is less than zero', () => {
    try {
      overpaymentResponse = new OverpaymentResponse(OVERPAYMENT_AMOUNT, '-1', REASON, IS_OVERPAID)
      expect.fail()
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError)
      expect(e.validationErrors['overpayment-remaining']).toContain(
        'The remaining overpayment amount must be greater than or equal to zero',
      )
    }
  })

  it('should throw validation error if overpayment remaining value is not a currency value', () => {
    try {
      overpaymentResponse = new OverpaymentResponse(
        OVERPAYMENT_AMOUNT,
        `${OVERPAYMENT_REMAINING}!`,
        REASON,
        IS_OVERPAID,
      )
      expect.fail()
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError)
      expect(e.validationErrors['overpayment-remaining']).toContain(
        'The remaining overpayment amount must be a valid currency',
      )
    }
  })

  it('should throw validation error if overpayment amount value is empty', () => {
    try {
      overpaymentResponse = new OverpaymentResponse('', OVERPAYMENT_REMAINING, REASON, IS_NOT_OVERPAID)
      expect.fail()
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError)
      expect(e.validationErrors['overpayment-amount']).toContain('An overpayment amount is required')
    }
  })

  it('should throw validation error if overpayment amount value is less than zero', () => {
    try {
      overpaymentResponse = new OverpaymentResponse('0', OVERPAYMENT_REMAINING, REASON, IS_NOT_OVERPAID)
      expect.fail()
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError)
      expect(e.validationErrors['overpayment-amount']).toContain('An overpayment amount must be greater than zero')
    }
  })

  it('should throw validation error if overpayment amount value is not a currency value', () => {
    try {
      overpaymentResponse = new OverpaymentResponse(
        `${OVERPAYMENT_AMOUNT}!`,
        `${OVERPAYMENT_REMAINING}!`,
        REASON,
        IS_NOT_OVERPAID,
      )
      expect.fail()
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError)
      expect(e.validationErrors['overpayment-amount']).toContain('An overpayment amount must be a valid currency')
    }
  })

  it("should have an action of 'update'", () => {
    const claimCurrentlyOverpaid = true

    overpaymentResponse = new OverpaymentResponse('', '5', REASON, claimCurrentlyOverpaid)

    expect(overpaymentResponse.action).toBe(overpaymentActionEnum.UPDATE)
  })

  it("should have an action of 'resolve'", () => {
    const claimCurrentlyOverpaid = true

    overpaymentResponse = new OverpaymentResponse('', '0', REASON, claimCurrentlyOverpaid)

    expect(overpaymentResponse.action).toBe(overpaymentActionEnum.RESOLVE)
  })

  it("should have an action of 'overpaid'", () => {
    const claimCurrentlyOverpaid = false

    overpaymentResponse = new OverpaymentResponse('10', '10', REASON, claimCurrentlyOverpaid)

    expect(overpaymentResponse.action).toBe(overpaymentActionEnum.OVERPAID)
  })
})
