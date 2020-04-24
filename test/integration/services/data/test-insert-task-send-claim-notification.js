const expect = require('chai').expect
const config = require('../../../../knexfile').migrations
const knex = require('knex')(config)
const dateFormatter = require('../../../../app/services/date-formatter')
const tasksEnum = require('../../../../app/constants/tasks-enum')
const taskStatusEnum = require('../../../../app/constants/task-status-enum')
const databaseHelper = require('../../../helpers/database-setup-for-tests')

const insertTaskSendClaimNotification = require('../../../../app/services/data/insert-task-send-claim-notification')

var testData
var date
var reference = 'NOTE123'
var claimId
var eligibilityId
var emailAddress = 'test-apvs@apvs.com'
var eligibilityIdDoesNotExist = 9876554

describe('services/data/insert-task-send-first-time-claim-notification', function () {
  before(function () {
    testData = databaseHelper.getTestData(reference, 'Test')
    date = dateFormatter.now().toDate()
    return databaseHelper.insertTestData(reference, date, 'Test').then(function (ids) {
      claimId = ids.claimId
      eligibilityId = ids.eligibilityId
    })
  })

  it('should insert a new task to send the first time claim notification', function () {
    return insertTaskSendClaimNotification(tasksEnum.ACCEPT_CLAIM_NOTIFICATION, reference, eligibilityId, claimId)
      .then(function () {
        return knex.first().from('IntSchema.Task').where({ Reference: reference, ClaimId: claimId })
          .then(function (task) {
            expect(task.Task).to.equal(tasksEnum.ACCEPT_CLAIM_NOTIFICATION)
            expect(task.Reference).to.equal(reference)
            expect(task.ClaimId).to.equal(claimId)
            expect(task.AdditionalData).to.equal(testData.Visitor.EmailAddress)
            expect(task.DateCreated).to.be.within(dateFormatter.now().add(-2, 'minutes').toDate(), dateFormatter.now().add(2, 'minutes').toDate())
            expect(task.Status).to.equal(taskStatusEnum.PENDING)
          })
      })
  })

  it('should insert a new task to send a notification to a specific email address', function () {
    return insertTaskSendClaimNotification(tasksEnum.ACCEPT_CLAIM_NOTIFICATION, reference, eligibilityIdDoesNotExist, claimId, emailAddress)
      .then(function () {
        return knex.first().from('IntSchema.Task').where('EligibilityId', eligibilityIdDoesNotExist)
          .then(function (task) {
            expect(task.AdditionalData).to.equal(emailAddress)
          })
      })
  })

  after(function () {
    return databaseHelper.deleteAll(reference)
  })
})
