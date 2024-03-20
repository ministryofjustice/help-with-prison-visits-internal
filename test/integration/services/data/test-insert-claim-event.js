const dateFormatter = require('../../../../app/services/date-formatter')
const { insertTestData, deleteAll, db } = require('../../../helpers/database-setup-for-tests')

const insertClaimEvent = require('../../../../app/services/data/insert-claim-event')

const REFERENCE = 'CLAIMEV'
const EVENT = 'TEST-EVENT'
const ADDITIONAL_DATA = 'ADDITIONAL_DATA'
const NOTE = 'NOTE'
const CASEWORKER = 'CASEWORKER'
const IS_INTERNAL = false

let eligibilityId
let claimId

describe('services/data/insert-claim-event', function () {
  beforeAll(function () {
    return insertTestData(REFERENCE, dateFormatter.now().toDate(), 'Test').then(function (ids) {
      claimId = ids.claimId
      eligibilityId = ids.eligibilityId
    })
  })

  it('should insert a claim event', function () {
    return insertClaimEvent(REFERENCE, eligibilityId, claimId, EVENT, ADDITIONAL_DATA, NOTE, CASEWORKER, IS_INTERNAL)
      .then(function () {
        return db.first().from('ClaimEvent')
          .where({ EligibilityId: eligibilityId, Reference: REFERENCE, ClaimId: claimId })
          .orderBy('DateAdded', 'desc')
      })
      .then(function (claimEvent) {
        expect(claimEvent.EligibilityId).toBe(eligibilityId)
        expect(claimEvent.Reference).toBe(REFERENCE)
        expect(claimEvent.ClaimId).toBe(claimId)
        expect(claimEvent.DateAdded).toBeGreaterThanOrEqual(dateFormatter.now().add(-2, 'minutes').toDate())
        expect(claimEvent.DateAdded).toBeLessThanOrEqual(dateFormatter.now().add(2, 'minutes').toDate())
        expect(claimEvent.Event).toBe(EVENT)
        expect(claimEvent.AdditionalData).toBe(ADDITIONAL_DATA)
        expect(claimEvent.Note).toBe(NOTE)
        expect(claimEvent.Caseworker).toBe(CASEWORKER)
        expect(claimEvent.IsInternal).toBe(IS_INTERNAL)
      })
  })

  afterAll(function () {
    return deleteAll(REFERENCE)
  })
})
