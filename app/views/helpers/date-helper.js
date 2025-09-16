const moment = require('moment')

module.exports.shortDate = date => {
  return moment.utc(date).format('DD/MM/YYYY')
}

module.exports.longDate = date => {
  return moment.utc(date).format('Do MMMM YYYY')
}

module.exports.shortDateAndTime = date => {
  return date ? moment.utc(date).format('DD/MM/YY HH:mm') : ''
}

module.exports.getDay = date => {
  return moment.utc(date).format('D')
}

module.exports.getMonth = date => {
  return moment.utc(date).format('M')
}

module.exports.getYear = date => {
  return moment.utc(date).format('YYYY')
}

module.exports.shortDateAndTimeUTC = date => {
  return moment.utc(date)
}
