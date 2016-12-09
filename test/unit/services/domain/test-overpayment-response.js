const OverpaymentResponse = require('../../../../app/services/domain/overpayment-response')
const ValidationError = require('../../../../app/services/errors/validation-error')
const expect = require('chai').expect
var overpaymentResponse

describe('services/domain/claim-deduction', function () {
  const IS_OVERPAID = true
  const IS_NOT_OVERPAID = false
  const OVERPAYMENT_AMOUNT = '10'

  it('should construct a domain object given valid input', function () {
    overpaymentResponse = new OverpaymentResponse(IS_OVERPAID, OVERPAYMENT_AMOUNT)
    expect(overpaymentResponse.isOverpaid).to.equal(IS_OVERPAID)
    expect(overpaymentResponse.amount).to.equal(OVERPAYMENT_AMOUNT)
  })

  it('should return no validation errors for amount if isOverpaid is false', function () {
    overpaymentResponse = new OverpaymentResponse(IS_NOT_OVERPAID)

    expect(overpaymentResponse.isOverpaid).to.equal(IS_NOT_OVERPAID)
    expect(overpaymentResponse.amount).to.not.exist
  })

  it('should return isRequired error for amount if isOverpaid is true and amount is empty', function () {
    try {
      overpaymentResponse = new OverpaymentResponse(IS_OVERPAID, '')
      expect.fail()
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['overpayment-amount'][0]).to.equal('An overpayment amount is required')
    }
  })

  it('should return isGreaterThanZero error for decision if amount is less than zero', function () {
    try {
      overpaymentResponse = new OverpaymentResponse(IS_OVERPAID, `-${OVERPAYMENT_AMOUNT}`)
      expect.fail()
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['overpayment-amount'][0]).to.equal('An overpayment amount must be greater than zero')
    }
  })

  it('should return isCurrency error for decision if amount is not in currency format', function () {
    try {
      overpaymentResponse = new OverpaymentResponse(IS_OVERPAID, `${OVERPAYMENT_AMOUNT}!`)
      expect.fail()
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['overpayment-amount']).to.contain('An overpayment amount must be greater than zero')
      expect(e.validationErrors['overpayment-amount']).to.contain('An overpayment amount must be a valid currency')
    }
  })
})
