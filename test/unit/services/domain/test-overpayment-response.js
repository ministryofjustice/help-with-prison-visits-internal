const OverpaymentResponse = require('../../../../app/services/domain/overpayment-response')
const ValidationError = require('../../../../app/services/errors/validation-error')
const overpaymentActionEnum = require('../../../../app/constants/overpayment-action-enum')
const expect = require('chai').expect
let overpaymentResponse

describe('services/domain/overpayment-response', function () {
  const IS_OVERPAID = true
  const IS_NOT_OVERPAID = false
  const OVERPAYMENT_AMOUNT = '10'
  const OVERPAYMENT_REMAINING = '5'
  const REASON = 'reason'

  it('should construct a domain object given valid input', function () {
    overpaymentResponse = new OverpaymentResponse(OVERPAYMENT_AMOUNT, OVERPAYMENT_REMAINING, REASON, IS_OVERPAID)
    expect(overpaymentResponse.action).to.not.be.null //eslint-disable-line
    expect(overpaymentResponse.amount).to.equal(OVERPAYMENT_AMOUNT)
    expect(overpaymentResponse.remaining).to.equal(OVERPAYMENT_REMAINING)
    expect(overpaymentResponse.reason).to.equal(REASON)
  })

  it('should throw validation error if overpayment remaining value doesnt exist', function () {
    try {
      overpaymentResponse = new OverpaymentResponse(OVERPAYMENT_AMOUNT, '', REASON, IS_OVERPAID)
      expect.fail()
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['overpayment-remaining']).to.contain('The remaining overpayment amount is required')
    }
  })

  it('should not throw validation error if overpayment remaining value is zero', function () {
    try {
      overpaymentResponse = new OverpaymentResponse(OVERPAYMENT_AMOUNT, '0', REASON, IS_OVERPAID)
    } catch (e) {
      expect.fail('Validation error thrown')
    }
  })

  it('should throw validation error if overpayment remaining value is less than zero', function () {
    try {
      overpaymentResponse = new OverpaymentResponse(OVERPAYMENT_AMOUNT, '-1', REASON, IS_OVERPAID)
      expect.fail()
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['overpayment-remaining']).to.contain('The remaining overpayment amount must be greater than or equal to zero')
    }
  })

  it('should throw validation error if overpayment remaining value is not a currency value', function () {
    try {
      overpaymentResponse = new OverpaymentResponse(OVERPAYMENT_AMOUNT, OVERPAYMENT_REMAINING + '!', REASON, IS_OVERPAID)
      expect.fail()
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['overpayment-remaining']).to.contain('The remaining overpayment amount must be a valid currency')
    }
  })

  it('should throw validation error if overpayment amount value is empty', function () {
    try {
      overpaymentResponse = new OverpaymentResponse('', OVERPAYMENT_REMAINING, REASON, IS_NOT_OVERPAID)
      expect.fail()
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['overpayment-amount']).to.contain('An overpayment amount is required')
    }
  })

  it('should throw validation error if overpayment amount value is less than zero', function () {
    try {
      overpaymentResponse = new OverpaymentResponse('0', OVERPAYMENT_REMAINING, REASON, IS_NOT_OVERPAID)
      expect.fail()
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['overpayment-amount']).to.contain('An overpayment amount must be greater than zero')
    }
  })

  it('should throw validation error if overpayment amount value is not a currency value', function () {
    try {
      overpaymentResponse = new OverpaymentResponse(OVERPAYMENT_AMOUNT + '!', OVERPAYMENT_REMAINING + '!', REASON, IS_NOT_OVERPAID)
      expect.fail()
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['overpayment-amount']).to.contain('An overpayment amount must be a valid currency')
    }
  })

  it('should have an action of \'update\'', function () {
    const claimCurrentlyOverpaid = true

    overpaymentResponse = new OverpaymentResponse('', '5', REASON, claimCurrentlyOverpaid)

    expect(overpaymentResponse.action).to.equal(overpaymentActionEnum.UPDATE)
  })

  it('should have an action of \'resolve\'', function () {
    const claimCurrentlyOverpaid = true

    overpaymentResponse = new OverpaymentResponse('', '0', REASON, claimCurrentlyOverpaid)

    expect(overpaymentResponse.action).to.equal(overpaymentActionEnum.RESOLVE)
  })

  it('should have an action of \'overpaid\'', function () {
    const claimCurrentlyOverpaid = false

    overpaymentResponse = new OverpaymentResponse('10', '10', REASON, claimCurrentlyOverpaid)

    expect(overpaymentResponse.action).to.equal(overpaymentActionEnum.OVERPAID)
  })
})
