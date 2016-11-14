const expect = require('chai').expect
const config = require('../../../../knexfile').migrations
const knex = require('knex')(config)
const moment = require('moment')
const tasksEnum = require('../../../../app/constants/tasks-enum')
const taskStatusEnum = require('../../../../app/constants/task-status-enum')
const databaseHelper = require('../../../helpers/database-setup-for-tests')

const insertTaskSendClaimNotification = require('../../../../app/services/data/insert-task-send-claim-notification')

var testData
var date
var reference = 'NOTE123'
var claimId
var eligibilityId
var prisonerId
var visitorId
var expenseId1
var expenseId2
var childId1
var childId2

describe('services/data/insert-task-send-first-time-claim-notification', function () {
  before(function () {
    testData = databaseHelper.getTestData(reference, 'Test')
    date = moment().toDate()
    return databaseHelper.insertTestData(reference, date, 'Test').then(function (ids) {
      claimId = ids.claimId
      eligibilityId = ids.eligibilityId
      prisonerId = ids.prisonerId
      visitorId = ids.visitorId
      expenseId1 = ids.expenseId1
      expenseId2 = ids.expenseId2
      childId1 = ids.childId1
      childId2 = ids.childId2
    })
  })

  it('should insert a new task to send the first time claim notification', function () {
    return insertTaskSendClaimNotification(tasksEnum.ACCEPT_CLAIM_NOTIFICATION, reference, eligibilityId, claimId)
      .then(function () {
        return knex.first().from('IntSchema.Task').where({Reference: reference, ClaimId: claimId})
          .then(function (task) {
            expect(task.Task).to.equal(tasksEnum.ACCEPT_CLAIM_NOTIFICATION)
            expect(task.Reference).to.equal(reference)
            expect(task.ClaimId).to.equal(claimId)
            expect(task.AdditionalData).to.equal(testData.Visitor.EmailAddress)
            expect(task.DateCreated).to.be.within(moment().add(-2, 'minutes').toDate(), moment().add(2, 'minutes').toDate())
            expect(task.Status).to.equal(taskStatusEnum.PENDING)
          })
      })
  })

  after(function () {
    return knex('IntSchema.Task').where({Reference: reference, ClaimId: claimId}).del().then(function () {
      return databaseHelper.deleteTestData(
        claimId,
        eligibilityId,
        visitorId,
        prisonerId,
        expenseId1,
        expenseId2,
        childId1,
        childId2
      )
    })
  })
})
