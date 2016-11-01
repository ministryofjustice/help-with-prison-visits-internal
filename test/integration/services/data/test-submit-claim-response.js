const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')
const config = require('../../../../knexfile').migrations
const knex = require('knex')(config)
const moment = require('moment')
const databaseHelper = require('../../../helpers/database-setup-for-tests')
const claimDecisionEnum = require('../../../../app/constants/claim-decision-enum')

var stubInsertTaskSendClaimNotification = sinon.stub().resolves()

const submitClaimResponse = proxyquire('../../../../app/services/data/submit-claim-response', {
  './insert-task-send-claim-notification': stubInsertTaskSendClaimNotification
})

var reference = 'SUBC456'
var newIds = {}

describe('services/data/submit-claim-response', function () {
  before(function () {
    return databaseHelper.insertTestData(reference, moment().toDate(), 'NEW').then(function (ids) {
      newIds = {'claimId': ids.claimId, 'eligibilityId': ids.eligibilityId, 'prisonerId': ids.prisonerId, 'visitorId': ids.visitorId, 'expenseId1': ids.expenseId1, 'expenseId2': ids.expenseId2}
    })
  })

  it('should update eligibility and claim then call to send notification', function () {
    var claimId = newIds.claimId
    var claimResponse = {
      'decision': claimDecisionEnum.REJECTED,
      'reason': 'No valid relationship to prisoner',
      'note': 'Could not verify in NOMIS'
    }

    return submitClaimResponse(claimId, claimResponse)
      .then(function (result) {
        return knex('IntSchema.Eligibility').where('Reference', reference)
          .join('IntSchema.Claim', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Claim.EligibilityId')
          .first()
          .then(function (result) {
            expect(result.Status[0]).to.be.equal(claimDecisionEnum.REJECTED)
            expect(result.Status[1]).to.be.equal(claimDecisionEnum.REJECTED)
            expect(result.Reason).to.be.equal(claimResponse.reason)
            expect(result.Note).to.be.equal(claimResponse.note)
            expect(stubInsertTaskSendClaimNotification.called).to.be.true
          })
      })
  })

  after(function () {
    return databaseHelper.deleteTestData(newIds.claimId, newIds.eligibilityId, newIds.visitorId, newIds.prisonerId, newIds.expenseId1, newIds.expenseId2)
  })
})
