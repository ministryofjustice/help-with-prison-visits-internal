const expect = require('chai').expect
const dateFormatter = require('../../../../app/services/date-formatter')
const knexConfig = require('../../../../knexfile').intweb
const knex = require('knex')(knexConfig)
const databaseHelper = require('../../../helpers/database-setup-for-tests')
const claimStatusEnum = require('../../../../app/constants/claim-status-enum')
const claimEventEnum = require('../../../../app/constants/claim-event-enum')

const closeAdvanceClaim = require('../../../../app/services/data/close-advance-claim')
var reference = 'CCACTION'
var date
var claimId
var previousLastUpdated

describe('services/data/close-advance-claim', function () {
  describe('module', function () {
    before(function () {
      date = dateFormatter.now()
      return databaseHelper.insertTestData(reference, date.toDate(), 'TESTING').then(function (ids) {
        claimId = ids.claimId
        previousLastUpdated = ids.lastUpdated
      })
    })

    it(`should set claim status to ${claimStatusEnum.APPROVED_ADVANCE_CLOSED.value} and create claim event`, function () {
      var reason = 'Test reason'

      return closeAdvanceClaim(claimId, reason)
        .then(function () {
          return knex('Claim').first().where('ClaimId', claimId)
            .then(function (claim) {
              expect(claim.Status).to.equal(claimStatusEnum.APPROVED_ADVANCE_CLOSED.value)
              expect(claim.lastUpdated).to.not.equal(previousLastUpdated)
              return knex('ClaimEvent').first().where('ClaimId', claimId).orderBy('DateAdded', 'desc')
            })
            .then(function (claimEvent) {
              expect(claimEvent.Event).to.equal(claimEventEnum.CLOSE_ADVANCE_CLAIM.value)
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
