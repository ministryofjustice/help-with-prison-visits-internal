const dateFormatter = require('../../../../app/services/date-formatter')
const { insertTestData, deleteAll, db } = require('../../../helpers/database-setup-for-tests')

const insertTopup = require('../../../../app/services/data/insert-top-up')
const TopupResponse = require('../../../../app/services/domain/topup-response')
const topUpStatusEnum = require('../../../../app/constants/top-up-status-enum')
const claimEventEnum = require('../../../../app/constants/claim-event-enum')
const reference = 'V123456'
let date
let claimId

describe('services/data/insert-top-up', () => {
  describe('module', () => {
    beforeAll(() => {
      date = dateFormatter.now()
      return insertTestData(reference, date.toDate(), 'TESTING').then(function (ids) {
        claimId = ids.claimId
      })
    })

    it('should add a claim top up when called', () => {
      const amount = '141.80'
      const reason = 'This is a test'
      const topUp = new TopupResponse(amount, reason)

      return insertTopup({ ClaimId: claimId, Reference: reference, EligibilityId: claimId }, topUp, 'test@test.com')
        .then(() => {
          return db('TopUp').first().where('ClaimId', claimId)
        })
        .then(function (topUpReturned) {
          // 'Inserted TopUp TopUpAmount should equal ' + amount
          expect(Number(topUpReturned.TopUpAmount).toFixed(2)).toBe(amount)
          // 'Inserted Top Up TopUpReason should equal ' + reason
          expect(topUpReturned.Reason).toBe(reason)
          // Inserted Top Up PaymentStatus should equal PENDING
          expect(topUpReturned.PaymentStatus).toBe(topUpStatusEnum.PENDING)

          return db('ClaimEvent').first().where('ClaimId', claimId).orderBy('ClaimEventId', 'desc')
        })
        .then(function (claimEvent) {
          // 'ClaimEvent Event should equal ' + claimEventEnum.TOP_UP_SUBMITTED.value
          expect(claimEvent.Event).toBe(claimEventEnum.TOP_UP_SUBMITTED.value)
          // 'ClaimEvent Note should equal ' + reason
          expect(claimEvent.Note).toBe(reason)
        })
        .catch(error => {
          throw error
        })
    })

    afterAll(() => {
      return deleteAll(reference)
    })
  })
})
