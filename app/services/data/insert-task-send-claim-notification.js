const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const dateFormatter = require('../date-formatter')
const tasksEnum = require('../../constants/tasks-enum')
const taskStatusEnum = require('../../constants/task-status-enum')

module.exports = function (notificationType, reference, eligibilityId, claimId) {
  if (notificationType !== tasksEnum.ACCEPT_CLAIM_NOTIFICATION &&
      notificationType !== tasksEnum.REJECT_CLAIM_NOTIFICATION &&
      notificationType !== tasksEnum.REQUEST_INFORMATION_CLAIM_NOTIFICATION) {
    throw new Error('Invalid notification type')
  }

  return knex('Visitor').where('EligibilityId', eligibilityId).first('EmailAddress').then(function (result) {
    var emailAddress = result.EmailAddress

    return knex('Task').insert({
      Task: notificationType,
      Reference: reference,
      ClaimId: claimId,
      AdditionalData: emailAddress,
      DateCreated: dateFormatter.now().toDate(),
      Status: taskStatusEnum.PENDING
    })
  })
}
