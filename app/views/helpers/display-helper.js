const prisonsEnum = require('../../constants/prisons-enum')
const benefitsEnum = require('../../constants/benefits-enum')
const claimTypeEnum = require('../../constants/claim-type-enum')
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
