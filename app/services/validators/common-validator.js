/**
 * This file defines all generic validation tests used in the application. This file can and should be used by the
 * three higher level validators: FieldValidator, FieldSetValidator, and UrlPathValidator.
 */
const validator = require('validator')

const SQL_MAX_INT = 2147483647
const SQL_DEC_8_COMMA_2 = 999999.99
const moment = require('moment')

const config = require('../../../config')
const dateFormatter = require('../date-formatter')

const isNullOrUndefined = value => {
  return !value
}
exports.isNullOrUndefined = isNullOrUndefined

exports.isNumeric = value => {
  return validator.isNumeric(value) || validator.isDecimal(value)
}

exports.isCurrency = value => {
  return validator.isCurrency(value)
}

exports.isGreaterThanZero = value => {
  return value > 0
}

exports.isLessOrEqualToHundred = value => {
  return value <= 100
}

exports.isGreaterThanOrEqualToZero = value => {
  return value >= 0
}

exports.isGreaterThanMinimumClaim = value => {
  return value >= 0 && value !== null
}

exports.isLessThanMaximumDifferentApprovedAmount = value => {
  return value <= parseInt(config.MAX_APPROVED_DIFFERENT_AMOUNT, 10) && value !== null
}

exports.isEmail = value => {
  return validator.isEmail(value)
}

exports.isLessThanLength = (value, length) => {
  return validator.isLength(value, { max: length })
}

exports.isInteger = value => {
  return validator.isInt(value)
}

exports.isMaxIntOrLess = value => {
  return value <= SQL_MAX_INT
}

exports.isMaxCostOrLess = value => {
  return value <= SQL_DEC_8_COMMA_2
}

const isValidDate = date => {
  if (isNullOrUndefined(date)) {
    return false
  }
  return date instanceof moment && date.isValid()
}
exports.isValidDate = isValidDate

exports.isDateInTheFuture = date => {
  return isValidDate(date) && date > dateFormatter.now()
}
