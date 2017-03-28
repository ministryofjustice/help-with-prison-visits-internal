const dateFormatter = require('./date-formatter')

module.exports = function (user, assignedTo, assignmentExpiry) {
  return user === assignedTo && assignmentExpiry && assignmentExpiry > dateFormatter.now().toDate()
}
