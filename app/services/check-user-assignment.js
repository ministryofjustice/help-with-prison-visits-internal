const dateFormatter = require('./date-formatter')

module.exports = (user, assignedTo, assignmentExpiry) => {
  return user === assignedTo && assignmentExpiry && assignmentExpiry > dateFormatter.now().toDate()
}
