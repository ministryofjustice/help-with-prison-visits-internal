const moment = require('moment')

module.exports = function (currentLastUpdated, previousLastUpdated) {
  if (moment(currentLastUpdated).toString() === previousLastUpdated) {
    return false
  } else {
    return true
  }
}
