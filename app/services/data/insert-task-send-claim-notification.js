const Promise = require('bluebird')
const { getDatabaseConnector } = require('../../databaseConnector')
const dateFormatter = require('../date-formatter')
const tasksEnum = require('../../constants/tasks-enum')
const taskStatusEnum = require('../../constants/task-status-enum')

module.exports = function (notificationType, reference, eligibilityId, claimId, emailAddress) {
  if (notificationType !== tasksEnum.ACCEPT_CLAIM_NOTIFICATION &&
      notificationType !== tasksEnum.REJECT_CLAIM_NOTIFICATION &&
      notificationType !== tasksEnum.REQUEST_INFORMATION_CLAIM_NOTIFICATION &&
      notificationType !== tasksEnum.UPDATED_CONTACT_DETAILS_CLAIM_NOTIFICATION) {
    throw new Error('Invalid notification type')
  }

  return getEmailAddress(eligibilityId, emailAddress).then(function (toEmailAddress) {
    const db = getDatabaseConnector()

    return db('Task').insert({
      Task: notificationType,
      Reference: reference,
      EligibilityId: eligibilityId,
      ClaimId: claimId,
      AdditionalData: toEmailAddress,
      DateCreated: dateFormatter.now().toDate(),
      Status: taskStatusEnum.PENDING
    })
  })
}

function getEmailAddress (eligibilityId, emailAddress) {
  if (emailAddress) {
    return Promise.resolve(emailAddress)
  } else {
    const db = getDatabaseConnector()

    return db('Visitor').where('EligibilityId', eligibilityId).first('EmailAddress')
      .then(function (result) {
        return result.EmailAddress
      })
  }
}
