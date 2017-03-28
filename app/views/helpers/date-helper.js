const moment = require('moment')

module.exports.shortDate = function (date) {
  return moment(date).format('DD/MM/YYYY')
}

module.exports.longDate = function (date) {
  return moment(date).format('Do MMMM YYYY')
}

module.exports.shortDateAndTime = function (date) {
  console.log(moment(date).toDate())
  return moment.utc(date).format('DD/MM/YY HH:mm')
}
