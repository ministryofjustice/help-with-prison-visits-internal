const prisonsEnum = require('../../constants/prisons-enum')
const benefitsEnum = require('../../constants/benefits-enum')
const claimStatusEnum = require('../../constants/claim-status-enum')
const claimTypeEnum = require('../../constants/claim-type-enum')
const deductionTypeEnum = require('../../constants/deduction-type-enum')
const paymentMethodEnum = require('../../constants/payment-method-enum')
const enumHelper = require('../../constants/helpers/enum-helper')

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
  return element.displayName
}

module.exports.getPrisonRegion = function (value) {
  var element = enumHelper.getKeyByValue(prisonsEnum, value)
  return element.region
}

module.exports.getClaimTypeDisplayName = function (value) {
  var element = enumHelper.getKeyByValue(claimTypeEnum, value)
  return element.displayName
}

module.exports.getDeductionTypeDisplayName = function (value) {
  var element = enumHelper.getKeyByValue(deductionTypeEnum, value)
  return element.displayName
}

module.exports.getClaimStatusClosed = function (claimStatusValue) {
  var element = enumHelper.getKeyByValue(claimStatusEnum, claimStatusValue)
  return element.closed
}

module.exports.getPaymentMethodDisplayName = function (paymentMethodValue) {
  var element = enumHelper.getKeyByValue(paymentMethodEnum, paymentMethodValue)
  return element.displayName
}

module.exports.processDeductionAmounts = function (deductions) {
  if (deductions) {
    deductions.forEach(function (deduction) {
      deduction.Amount = Number(deduction.Amount).toFixed(2)
    })

    return deductions
  }
}
