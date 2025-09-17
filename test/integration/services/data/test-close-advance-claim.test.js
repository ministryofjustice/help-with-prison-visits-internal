const dateFormatter = require('../../../../app/services/date-formatter')
const { insertTestData, deleteAll, db } = require('../../../helpers/database-setup-for-tests')
const claimStatusEnum = require('../../../../app/constants/claim-status-enum')
const claimEventEnum = require('../../../../app/constants/claim-event-enum')

const closeAdvanceClaim = require('../../../../app/services/data/close-advance-claim')
const reference = 'CCACTION'
let date
let claimId
let previousLastUpdated

describe('services/data/close-advance-claim', () => {
  describe('module', () => {
    beforeAll(() => {
      date = dateFormatter.now()
      return insertTestData(reference, date.toDate(), 'TESTING').then(function (ids) {
        claimId = ids.claimId
        previousLastUpdated = ids.lastUpdated
      })
    })

    it(`should set claim status to ${claimStatusEnum.APPROVED_ADVANCE_CLOSED.value} and create claim event`, () => {
      const reason = 'Test reason'

      return closeAdvanceClaim(claimId, reason)
        .then(() => {
          return db('Claim').first().where('ClaimId', claimId)
        })
        .then(claim => {
          expect(claim.Status).toBe(claimStatusEnum.APPROVED_ADVANCE_CLOSED.value)
          expect(claim.lastUpdated).not.toBe(previousLastUpdated)
          return db('ClaimEvent').first().where('ClaimId', claimId).orderBy('DateAdded', 'desc')
        })
        .then(function (claimEvent) {
          expect(claimEvent.Event).toBe(claimEventEnum.CLOSE_ADVANCE_CLAIM.value)
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
