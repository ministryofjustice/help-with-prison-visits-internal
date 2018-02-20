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
const moment = require('moment')

module.exports.getBenefitDisplayName = function (value) {
  var element = enumHelper.getKeyByValue(benefitsEnum, value)
  return element.displayName
}

module.exports.getBenefitRequireUpload = function (value) {
  var element = enumHelper.getKeyByValue(benefitsEnum, value)
  return element.requireBenefitUpload
}

module.exports.getBenefitMultipage = function (value) {
  var element = enumHelper.getKeyByValue(benefitsEnum, value)
  return element.multipage
}

module.exports.getPrisonDisplayName = function (value) {
  var element = enumHelper.getKeyByValue(prisonsEnum, value)
  return !element.displayName ? value : element.displayName
}

module.exports.getPrisonRegion = function (value) {
  var element = enumHelper.getKeyByValue(prisonsEnum, value)
  return element.region
}

module.exports.getRegionRulesByValue = function (value) {
  var element = enumHelper.getKeyByValue(rulesEnum, value)
  return element.rules
}

module.exports.getClaimTypeDisplayName = function (value) {
  var element = enumHelper.getKeyByValue(claimTypeEnum, value)
  return element.displayName
}

module.exports.getDeductionTypeDisplayName = function (value) {
  var element = enumHelper.getKeyByValue(deductionTypeEnum, value)
  return element.displayName
}

module.exports.getClaimEventDisplayName = function (value) {
  var element = enumHelper.getKeyByValue(claimEventEnum, value)
  return element.displayName
}

module.exports.getClaimStatusClosed = function (claimStatusValue, isAdvanceClaim, dateOfJourney) {
  if (isAdvanceClaim && claimStatusValue === claimStatusEnum.UPDATED.value) {
    var currentDate = dateFormatter.now()
    if (moment(dateOfJourney).isSameOrBefore(currentDate, 'day')) {
      return true
    } else {
      return false
    }
  } else {
    var element = enumHelper.getKeyByValue(claimStatusEnum, claimStatusValue)
    return element.closed
  }
}

module.exports.getPaymentMethodDisplayName = function (paymentMethodValue) {
  var element = enumHelper.getKeyByValue(paymentMethodEnum, paymentMethodValue)
  return element.displayName
}

module.exports.toDecimal = function (value) {
  if (value !== null) {
    if (value.toString().indexOf('e') === -1 && value.toString().indexOf('E') === -1) {
      return `${Number(value).toFixed(2)}`
    } else {
      return value
    }
  } else {
    return value
  }
}
