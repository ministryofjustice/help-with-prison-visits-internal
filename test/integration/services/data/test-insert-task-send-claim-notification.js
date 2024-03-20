const dateFormatter = require('../../../../app/services/date-formatter')
const tasksEnum = require('../../../../app/constants/tasks-enum')
const taskStatusEnum = require('../../../../app/constants/task-status-enum')
const { getTestData, insertTestData, deleteAll, db } = require('../../../helpers/database-setup-for-tests')

const insertTaskSendClaimNotification = require('../../../../app/services/data/insert-task-send-claim-notification')

let testData
let date
const reference = 'NOTE123'
let claimId
let eligibilityId
const emailAddress = 'test-apvs@apvs.com'
const eligibilityIdDoesNotExist = 9876554

describe('services/data/insert-task-send-first-time-claim-notification', function () {
  beforeAll(function () {
    testData = getTestData(reference, 'Test')
    date = dateFormatter.now().toDate()
    return insertTestData(reference, date, 'Test').then(function (ids) {
      claimId = ids.claimId
      eligibilityId = ids.eligibilityId
    })
  })

  it('should insert a new task to send the first time claim notification', function () {
    return insertTaskSendClaimNotification(tasksEnum.ACCEPT_CLAIM_NOTIFICATION, reference, eligibilityId, claimId)
      .then(function () {
        return db.first().from('Task').where({ Reference: reference, ClaimId: claimId })
      })
      .then(function (task) {
      expect(task.Task).toBe(tasksEnum.ACCEPT_CLAIM_NOTIFICATION)
      expect(task.Reference).toBe(reference)
      expect(task.ClaimId).toBe(claimId)
      expect(task.AdditionalData).toBe(testData.Visitor.EmailAddress)
      expect(task.DateCreated).toBeGreaterThanOrEqual(dateFormatter.now().add(-2, 'minutes').toDate());
      expect(task.DateCreated).toBeLessThanOrEqual(dateFormatter.now().add(2, 'minutes').toDate())
      expect(task.Status).toBe(taskStatusEnum.PENDING)
    });
  })

  it('should insert a new task to send a notification to a specific email address', function () {
    return insertTaskSendClaimNotification(tasksEnum.ACCEPT_CLAIM_NOTIFICATION, reference, eligibilityIdDoesNotExist, claimId, emailAddress)
      .then(function () {
        return db.first().from('Task').where('EligibilityId', eligibilityIdDoesNotExist)
      })
      .then(function (task) {
        expect(task.AdditionalData).toBe(emailAddress)
      });
  })

  afterAll(function () {
    return deleteAll(reference)
  })
})
