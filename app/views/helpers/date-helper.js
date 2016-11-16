const moment = require('moment')

module.exports.shortDate = function (date) {
  return moment(date).format('DD/MM/YYYY')
}

module.exports.longDate = function (date) {
  return moment(date).format('Do MMMM YYYY')
}
