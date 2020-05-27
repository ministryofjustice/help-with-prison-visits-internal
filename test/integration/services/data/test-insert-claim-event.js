const expect = require('chai').expect
const config = require('../../../../knexfile').migrations
const knex = require('knex')(config)
const dateFormatter = require('../../../../app/services/date-formatter')
const databaseHelper = require('../../../helpers/database-setup-for-tests')

const insertClaimEvent = require('../../../../app/services/data/insert-claim-event')

const REFERENCE = 'CLAIMEV'
const EVENT = 'TEST-EVENT'
const ADDITIONAL_DATA = 'ADDITIONAL_DATA'
const NOTE = 'NOTE'
const CASEWORKER = 'CASEWORKER'
const IS_INTERNAL = false

var eligibilityId
var claimId

describe('services/data/insert-claim-event', function () {
  before(function () {
    return databaseHelper.insertTestData(REFERENCE, dateFormatter.now().toDate(), 'Test').then(function (ids) {
      claimId = ids.claimId
      eligibilityId = ids.eligibilityId
    })
  })

  it('should insert a claim event', function () {
    return insertClaimEvent(REFERENCE, eligibilityId, claimId, EVENT, ADDITIONAL_DATA, NOTE, CASEWORKER, IS_INTERNAL)
      .then(function () {
        return knex.first().from('IntSchema.ClaimEvent')
          .where({ EligibilityId: eligibilityId, Reference: REFERENCE, ClaimId: claimId })
          .orderBy('DateAdded', 'desc')
          .then(function (claimEvent) {
            expect(claimEvent.EligibilityId).to.equal(eligibilityId)
            expect(claimEvent.Reference).to.equal(REFERENCE)
            expect(claimEvent.ClaimId).to.equal(claimId)
            expect(claimEvent.DateAdded).to.be.within(dateFormatter.now().add(-2, 'minutes').toDate(), dateFormatter.now().add(2, 'minutes').toDate())
            expect(claimEvent.Event).to.equal(EVENT)
            expect(claimEvent.AdditionalData).to.equal(ADDITIONAL_DATA)
            expect(claimEvent.Note).to.equal(NOTE)
            expect(claimEvent.Caseworker).to.equal(CASEWORKER)
            expect(claimEvent.IsInternal).to.equal(IS_INTERNAL)
          })
      })
  })

  after(function () {
    return databaseHelper.deleteAll(REFERENCE)
  })
})
