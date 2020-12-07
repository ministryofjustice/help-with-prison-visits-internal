const ValidationError = require('../errors/validation-error')
const FieldValidator = require('../validators/field-validator')
const ErrorHandler = require('../validators/error-handler')
const overpaymentActionEnum = require('../../constants/overpayment-action-enum')

class OverpaymentResponse {
  constructor (amount, remaining, reason, currentOverpaymentStatus) {
    this.action = getOverpaymentStatus(amount, remaining, currentOverpaymentStatus)
    this.amount = amount
    this.remaining = remaining
    this.reason = reason

    this.IsValid()
  }

  IsValid () {
    const errors = ErrorHandler()

    if (this.action === overpaymentActionEnum.UPDATE || this.action === overpaymentActionEnum.RESOLVE) {
      FieldValidator(this.remaining, 'overpayment-remaining', errors)
        .isRequired()
        .isGreaterThanOrEqualToZero()
        .isCurrency()
    } else if (this.action === overpaymentActionEnum.OVERPAID) {
      FieldValidator(this.amount, 'overpayment-amount', errors)
        .isRequired()
        .isGreaterThanZero()
        .isCurrency()
        .isMaxCostOrLess()
    }

    FieldValidator(this.reason, 'reason', errors)
      .isLessThanLength(2000)

    const validationErrors = errors.get()

    if (validationErrors) {
      throw new ValidationError(validationErrors)
    }
  }
}

function getOverpaymentStatus (amount, remaining, claimCurrentlyOverpaid) {
  let result

  if (claimCurrentlyOverpaid) {
    if (remaining === '0') {
      result = overpaymentActionEnum.RESOLVE
    } else {
      result = overpaymentActionEnum.UPDATE
    }
  } else {
    result = overpaymentActionEnum.OVERPAID
  }

  return result
}

module.exports = OverpaymentResponse
