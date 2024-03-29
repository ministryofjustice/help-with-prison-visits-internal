const dateFormatter = require('../../../../app/services/date-formatter')
const { insertTestData, deleteAll, db } = require('../../../helpers/database-setup-for-tests')
const claimStatusEnum = require('../../../../app/constants/claim-status-enum')
const claimEventEnum = require('../../../../app/constants/claim-event-enum')

const payoutBarcodeExpiredClaim = require('../../../../app/services/data/payout-barcode-expired-claim')
const reference = 'POBAREX'
let date
let claimId
let previousLastUpdated

describe('services/data/payout-barcode-expired-claim', function () {
  describe('module', function () {
    beforeAll(function () {
      date = dateFormatter.now()
      return insertTestData(reference, date.toDate(), 'TESTING').then(function (ids) {
        claimId = ids.claimId
        previousLastUpdated = ids.lastUpdated
      })
    })

    it(`should set claim status to ${claimStatusEnum.APPROVED.value} and create claim event`, function () {
      const reason = 'Test reason'

      return payoutBarcodeExpiredClaim(claimId, reason)
        .then(function () {
          return db('Claim').first().where('ClaimId', claimId)
        })
        .then(function (claim) {
          expect(claim.Status).toBe(claimStatusEnum.APPROVED.value)
          expect(claim.DateApproved).toBeNull()
          expect(claim.PaymentStatus).toBeNull()
          expect(claim.lastUpdated).not.toBe(previousLastUpdated)

          return db('ClaimEvent').first().where('ClaimId', claimId).orderBy('DateAdded', 'desc')
        })
        .then(function (claimEvent) {
          expect(claimEvent.Event).toBe(claimEventEnum.PAYMENT_REISSUED.value)
          expect(claimEvent.Note).toBeNull()
          return db('ClaimEvent').first().where('ClaimId', claimId).orderBy('DateAdded', 'desc').limit(1).offset(1)
        })
        .then(function (claimEvent) {
          expect(claimEvent.Event).toBe(claimEventEnum.PAYOUT_BARCODE_EXPIRED.value)
          expect(claimEvent.Note).toBe(reason)
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
