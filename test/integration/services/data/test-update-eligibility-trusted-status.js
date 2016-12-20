const expect = require('chai').expect
const config = require('../../../../knexfile').migrations
const knex = require('knex')(config)
const databaseHelper = require('../../../helpers/database-setup-for-tests')
const dateFormatter = require('../../../../app/services/date-formatter')
const updateEligibilityTrustedStatus = require('../../../../app/services/data/update-eligibility-trusted-status')

const REFERENCE = 'UNTRUSTED'

var eligibilityId
var claimId

describe('services/data/insert-claim-event', function () {
  before(function () {
    return databaseHelper.insertTestData(REFERENCE, dateFormatter.now().toDate(), 'Test').then(function (ids) {
      claimId = ids.claimId
      eligibilityId = ids.eligibilityId
    })
  })

  it('should set the eligibility to untrusted and create a claim event', function () {
    var untrustedReason = 'untrusted reason'
    var isUntrusted = true

    return updateEligibilityTrustedStatus(claimId, isUntrusted, untrustedReason)
      .then(function () {
        return getEligibility(eligibilityId)
          .then(function (eligibility) {
            expect(eligibility.IsUntrusted).to.equal(isUntrusted)
            expect(eligibility.UntrustedReason).to.equal(untrustedReason)
          })
          .then(function () {
            return getClaimEvent(claimId)
              .then(function (claimEvent) {
                expect(claimEvent.Event).to.equal('UPDATE-CLAIM-TRUSTED-STATUS')
              })
          })
      })
  })

  it('should set the eligibility to trusted and create a claim event', function () {
    var untrustedReason = null
    var isUntrusted = false

    return updateEligibilityTrustedStatus(claimId, isUntrusted, untrustedReason)
      .then(function () {
        return getEligibility(eligibilityId)
          .then(function (eligibility) {
            expect(eligibility.IsUntrusted).to.equal(isUntrusted)
            expect(eligibility.UntrustedReason).to.equal(untrustedReason)
          })
          .then(function () {
            return getClaimEvent(claimId)
              .then(function (claimEvent) {
                expect(claimEvent.Event).to.equal('UPDATE-CLAIM-TRUSTED-STATUS')
              })
          })
      })
  })

  after(function () {
    return databaseHelper.deleteAll(REFERENCE)
  })
})

function getEligibility (eligibilityId) {
  return knex('IntSchema.Eligibility').first()
    .where('EligibilityId', eligibilityId)
}

function getClaimEvent (claimId) {
  return knex('IntSchema.ClaimEvent').first()
    .where('ClaimId', claimId)
    .orderBy('DateAdded', 'desc')
}
