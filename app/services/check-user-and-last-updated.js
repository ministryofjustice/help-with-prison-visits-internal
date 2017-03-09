const moment = require('moment')
const ValidationError = require('./errors/validation-error')
const ValidationErrorMessages = require('./validators/validation-error-messages')

module.exports = function (lastUpdatedData, previousLastUpdated, needAssignmentCheck, user) {
  // if (needAssignmentCheck && lastUpdatedData.AssignedTo !== user) {
  //   throw new ValidationError({UpdateConflict: [ValidationErrorMessages.getUserAssignmentConflict(lastUpdatedData.AssignedTo)]})
  // }
  if (!moment(lastUpdatedData.LastUpdated).toString() === previousLastUpdated) {
    throw new ValidationError({UpdateConflict: [ValidationErrorMessages.getUpdateConflict(lastUpdatedData.Status)]})
  }

  return Promise.resolve('User and last updated checked')
}
