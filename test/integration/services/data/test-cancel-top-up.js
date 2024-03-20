const dateFormatter = require('../../../../app/services/date-formatter')
const { insertTestData, deleteAll, db } = require('../../../helpers/database-setup-for-tests')

const insertTopup = require('../../../../app/services/data/insert-top-up')
const cancelTopup = require('../../../../app/services/data/cancel-top-up')
const TopupResponse = require('../../../../app/services/domain/topup-response')
const topUpStatusEnum = require('../../../../app/constants/top-up-status-enum')
const claimEventEnum = require('../../../../app/constants/claim-event-enum')
const reference = 'V123456'
let date
let claimId
const amount = '140.96'
const reason = 'This is a test. To be cancelled'
const topUp = new TopupResponse(amount, reason)

describe('services/data/cancel-top-up', function () {
  describe('module', function () {
    beforeAll(function () {
      date = dateFormatter.now()
      return insertTestData(reference, date.toDate(), 'TESTING').then(function (ids) {
        claimId = ids.claimId
        return insertTopup({ ClaimId: claimId, Reference: reference, EligibilityId: claimId }, topUp, 'test@test.com')
      })
    })

    it('should cancel all unpaid topups when called', function () {
      return cancelTopup({ ClaimId: claimId, Reference: reference, EligibilityId: claimId }, 'test@test.com')
        .then(function () {
          return db('TopUp').first().where('ClaimId', claimId)
        })
        .then(function (topUpReturned) {
          // 'Inserted TopUp TopUpAmount should equal ' + amount
          expect(Number(topUpReturned.TopUpAmount).toFixed(2)).toBe(amount)
          // 'Inserted Top Up TopUpReason should equal ' + reason
          expect(topUpReturned.Reason).toBe(reason)
          // Inserted Top Up PaymentStatus should equal CANCELLED
          expect(topUpReturned.PaymentStatus).toBe(topUpStatusEnum.CANCELLED)

          return db('ClaimEvent').first().where('ClaimId', claimId).orderBy('ClaimEventId', 'desc')
        })
        .then(function (claimEvent) {
          // 'ClaimEvent Event should equal ' + claimEventEnum.TOP_UP_CANCELLED.value
          expect(claimEvent.Event).toBe(claimEventEnum.TOP_UP_CANCELLED.value)
        })
        .catch(function (error) {
          throw error
        })
    })

    afterAll(function () {
      return deleteAll(reference)
    })
  })
})
