const moment = require('moment')

module.exports.shortDate = function (date) {
  return moment.utc(date).format('DD/MM/YYYY')
}

module.exports.longDate = function (date) {
  return moment.utc(date).format('Do MMMM YYYY')
}

module.exports.shortDateAndTime = function (date) {
  return date ? moment.utc(date).format('DD/MM/YY HH:mm') : ''
}

module.exports.getDay = function (date) {
  return moment.utc(date).format('D')
}

module.exports.getMonth = function (date) {
  return moment.utc(date).format('M')
}

module.exports.getYear = function (date) {
  return moment.utc(date).format('YYYY')
}
