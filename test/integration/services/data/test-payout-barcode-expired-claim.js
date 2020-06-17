const expect = require('chai').expect
const dateFormatter = require('../../../../app/services/date-formatter')
const config = require('../../../../knexfile').intweb
const knex = require('knex')(config)
const databaseHelper = require('../../../helpers/database-setup-for-tests')
const claimStatusEnum = require('../../../../app/constants/claim-status-enum')
const claimEventEnum = require('../../../../app/constants/claim-event-enum')

const payoutBarcodeExpiredClaim = require('../../../../app/services/data/payout-barcode-expired-claim')
var reference = 'POBAREX'
var date
var claimId
var previousLastUpdated

describe('services/data/payout-barcode-expired-claim', function () {
  describe('module', function () {
    before(function () {
      date = dateFormatter.now()
      return databaseHelper.insertTestData(reference, date.toDate(), 'TESTING').then(function (ids) {
        claimId = ids.claimId
        previousLastUpdated = ids.lastUpdated
      })
    })

    it(`should set claim status to ${claimStatusEnum.APPROVED.value} and create claim event`, function () {
      var reason = 'Test reason'

      return payoutBarcodeExpiredClaim(claimId, reason)
        .then(function () {
          return knex('Claim').first().where('ClaimId', claimId)
            .then(function (claim) {
              expect(claim.Status).to.equal(claimStatusEnum.APPROVED.value)
              expect(claim.DateApproved).to.be.null //eslint-disable-line
              expect(claim.PaymentStatus).to.be.null //eslint-disable-line
              expect(claim.lastUpdated).to.not.equal(previousLastUpdated)
              return knex('ClaimEvent').first().where('ClaimId', claimId).orderBy('DateAdded', 'desc')
            })
            .then(function (claimEvent) {
              expect(claimEvent.Event).to.equal(claimEventEnum.PAYMENT_REISSUED.value)
              expect(claimEvent.Note).to.equal(null)
              return knex('ClaimEvent').first().where('ClaimId', claimId).orderBy('DateAdded', 'desc').limit(1).offset(1)
            })
            .then(function (claimEvent) {
              expect(claimEvent.Event).to.equal(claimEventEnum.PAYOUT_BARCODE_EXPIRED.value)
              expect(claimEvent.Note).to.equal(reason)
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
