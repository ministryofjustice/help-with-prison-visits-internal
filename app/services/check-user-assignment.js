const moment = require('moment')

module.exports = function (user, assignedTo, assignmentExpiry) {
  return user === assignedTo && assignmentExpiry && assignmentExpiry > moment().toDate()
}
