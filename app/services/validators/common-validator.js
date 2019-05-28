const config = require('../../../config')
/**
 * This file defines all generic validation tests used in the application. This file can and should be used by the
 * three higher level validators: FieldValidator, FieldSetValidator, and UrlPathValidator.
 */
const validator = require('validator')
const SQL_MAX_INT = 2147483647
const SQL_DEC_8_COMMA_2 = 999999.99
const moment = require('moment')
const dateFormatter = require('../date-formatter')

exports.isNullOrUndefined = function (value) {
  return !value
}

exports.isNumeric = function (value) {
  return validator.isNumeric(value) || validator.isDecimal(value)
}

exports.isCurrency = function (value) {
  return validator.isCurrency(value)
}

exports.isGreaterThanZero = function (value) {
  return value > 0
}

exports.isGreaterThanOrEqualToZero = function (value) {
  return value >= 0
}

exports.isGreaterThanMinimumClaim = function (value) {
  return value >= 0 && value !== null
}

exports.isLessThanMaximumDifferentApprovedAmount = function (value) {
  return value <= parseInt(config.MAX_APPROVED_DIFFERENT_AMOUNT) && value !== null
}

exports.isEmail = function (value) {
  return validator.isEmail(value)
}

exports.isLessThanLength = function (value, length) {
  return validator.isLength(value, { max: length })
}

exports.isInteger = function (value) {
  return validator.isInt(value)
}

exports.isMaxIntOrLess = function (value) {
  return value <= SQL_MAX_INT
}

exports.isMaxCostOrLess = function (value) {
  return value <= SQL_DEC_8_COMMA_2
}

exports.isValidDate = function (date) {
  if (this.isNullOrUndefined(date)) {
    return false
  }
  return date instanceof moment &&
    date.isValid()
}

exports.isDateInTheFuture = function (date) {
  return this.isValidDate(date) &&
    date > dateFormatter.now()
}
