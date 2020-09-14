const expect = require('chai').expect
const dateFormatter = require('../../../../app/services/date-formatter')
const config = require('../../../../knexfile').intweb
const knex = require('knex')(config)
const databaseHelper = require('../../../helpers/database-setup-for-tests')

const insertTopup = require('../../../../app/services/data/insert-top-up')
const TopupResponse = require('../../../../app/services/domain/topup-response')
const topUpStatusEnum = require('../../../../app/constants/top-up-status-enum')
const claimEventEnum = require('../../../../app/constants/claim-event-enum')
var reference = 'V123456'
var date
var claimId

describe('services/data/insert-top-up', function () {
  describe('module', function () {
    before(function () {
      date = dateFormatter.now()
      return databaseHelper.insertTestData(reference, date.toDate(), 'TESTING').then(function (ids) {
        claimId = ids.claimId
      })
    })

    it('should add a claim top up when called', function () {
      var amount = '141.80'
      var reason = 'This is a test'
      var topUp = new TopupResponse(amount, reason)

      return insertTopup({ ClaimId: claimId, Reference: reference, EligibilityId: claimId }, topUp, 'test@test.com')
        .then(function () {
          return knex('TopUp').first().where('ClaimId', claimId)
            .then(function (topUpReturned) {
              expect(Number(topUpReturned.TopUpAmount).toFixed(2), 'Inserted TopUp TopUpAmount should equal ' + amount).to.equal(amount)
              expect(topUpReturned.Reason, 'Inserted Top Up TopUpReason should equal ' + reason).to.equal(reason)
              expect(topUpReturned.PaymentStatus, 'Inserted Top Up PaymentStatus should equal PENDING').to.equal(topUpStatusEnum.PENDING)
              return knex('ClaimEvent').first().where('ClaimId', claimId).orderBy('ClaimEventId', 'desc')
                .then(function (claimEvent) {
                  expect(claimEvent.Event, 'ClaimEvent Event should equal ' + claimEventEnum.TOP_UP_SUBMITTED.value).to.equal(claimEventEnum.TOP_UP_SUBMITTED.value)
                  expect(claimEvent.Note, 'ClaimEvent Note should equal ' + reason).to.equal(reason)
                })
            })
        })
        .catch(function (error) {
          throw error
        })
    })

    after(function () {
      return databaseHelper.deleteAll(reference)
    })
  })
})
