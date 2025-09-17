const moment = require('moment')
const prisonsEnum = require('../../constants/prisons-enum')
const benefitsEnum = require('../../constants/benefits-enum')
const claimStatusEnum = require('../../constants/claim-status-enum')
const claimTypeEnum = require('../../constants/claim-type-enum')
const deductionTypeEnum = require('../../constants/deduction-type-enum')
const paymentMethodEnum = require('../../constants/payment-method-enum')
const rulesEnum = require('../../constants/region-rules-enum')
const claimEventEnum = require('../../constants/claim-event-enum')
const enumHelper = require('../../constants/helpers/enum-helper')
const dateFormatter = require('../../services/date-formatter')

module.exports.getBenefitDisplayName = value => {
  const element = enumHelper.getKeyByValue(benefitsEnum, value)
  return element.displayName
}

module.exports.getBenefitRequireUpload = value => {
  const element = enumHelper.getKeyByValue(benefitsEnum, value)
  return element.requireBenefitUpload
}

module.exports.getBenefitMultipage = value => {
  const element = enumHelper.getKeyByValue(benefitsEnum, value)
  return element.multipage
}

module.exports.getPrisonDisplayName = value => {
  const element = enumHelper.getKeyByValue(prisonsEnum, value)
  return !element.displayName ? value : element.displayName
}

module.exports.getPrisonRegion = value => {
  const element = enumHelper.getKeyByValue(prisonsEnum, value)
  return element.region
}

module.exports.getRegionRulesByValue = value => {
  const element = enumHelper.getKeyByValue(rulesEnum, value)
  return element.rules
}

module.exports.getClaimTypeDisplayName = value => {
  const element = enumHelper.getKeyByValue(claimTypeEnum, value)
  return element.displayName
}

module.exports.getDeductionTypeDisplayName = value => {
  const element = enumHelper.getKeyByValue(deductionTypeEnum, value)
  return element.displayName
}

module.exports.getClaimEventDisplayName = value => {
  const element = enumHelper.getKeyByValue(claimEventEnum, value)
  return element.displayName
}

module.exports.getClaimStatusClosed = (claimStatusValue, isAdvanceClaim, dateOfJourney) => {
  if (isAdvanceClaim && claimStatusValue === claimStatusEnum.UPDATED.value) {
    const currentDate = dateFormatter.now()
    if (moment(dateOfJourney).isSameOrBefore(currentDate, 'day')) {
      return true
    }
    return false
  }
  const element = enumHelper.getKeyByValue(claimStatusEnum, claimStatusValue)
  return element.closed
}

module.exports.getPaymentMethodDisplayName = paymentMethodValue => {
  const element = enumHelper.getKeyByValue(paymentMethodEnum, paymentMethodValue)
  return element.displayName
}

module.exports.toDecimal = value => {
  if (value !== null) {
    if (value.toString().indexOf('e') === -1 && value.toString().indexOf('E') === -1) {
      return `${Number(value).toFixed(2)}`
    }
    return value
  }
  return `${Number(value).toFixed(2)}`
}

module.exports.maskString = (unmaskedValue, visibleCharacterCount) => {
  const result = `${'*'.repeat(unmaskedValue.length - visibleCharacterCount)}${unmaskedValue.substring(visibleCharacterCount, unmaskedValue.length)}`
  return result
}
