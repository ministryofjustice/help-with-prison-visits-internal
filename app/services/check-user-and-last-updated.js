const moment = require('moment')
const dateFormatter = require('./date-formatter')
const ValidationError = require('./errors/validation-error')
const ValidationErrorMessages = require('./validators/validation-error-messages')
const checkUserAssignment = require('./check-user-assignment')

module.exports = function (lastUpdatedData, previousLastUpdated, needAssignmentCheck, user) {
  if (needAssignmentCheck && !checkUserAssignment(user, lastUpdatedData.AssignedTo, lastUpdatedData.AssignmentExpiry)) {
    if (lastUpdatedData.AssignedTo && lastUpdatedData.AssignmentExpiry > dateFormatter.now().toDate()) {
      throw new ValidationError({ UpdateConflict: [ValidationErrorMessages.getUserAssignmentConflict(lastUpdatedData.AssignedTo)] })
    } else {
      throw new ValidationError({ UpdateConflict: [ValidationErrorMessages.getUserNotAssigned()] })
    }
  }
  if (!(moment(lastUpdatedData.LastUpdated).toString() === previousLastUpdated)) {
    throw new ValidationError({ UpdateConflict: [ValidationErrorMessages.getUpdateConflict(lastUpdatedData.Status)] })
  }

  return Promise.resolve('User and last updated checked')
}
