const expect = require('chai').expect
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const config = require('../../../../knexfile').migrations
const knex = require('knex')(config)
const databaseHelper = require('../../../helpers/database-setup-for-tests')
const dateFormatter = require('../../../../app/services/date-formatter')

var sandbox = sinon.createSandbox()
var stubInsertClaimEvent = sandbox.stub().resolves()
var stubInsertTaskSendClaimNotification = sandbox.stub().resolves()

const updateVisitorContactDetails = proxyquire('../../../../app/services/data/update-visitor-contact-details', {
  './insert-claim-event': stubInsertClaimEvent,
  './insert-task-send-claim-notification': stubInsertTaskSendClaimNotification
})

const REFERENCE = 'UPDVISC'
const NEW_EMAIL_ADDRESS = 'new@new.com'
const NEW_PHONE_NUMBER = '987654321'
const OLD_EMAIL_ADDRESS = 'old@old.com'
const OLD_PHONE_NUMBER = '123456789'
const CASEWORKER = 'test@test.com'

var eligibilityId
var claimId

describe('services/data/update-visitor-contact-details', function () {
  beforeEach(function () {
    sandbox.reset()
  })

  before(function () {
    return databaseHelper.insertTestData(REFERENCE, dateFormatter.now().toDate(), 'Test').then(function (ids) {
      eligibilityId = ids.eligibilityId
      claimId = ids.claimId
    })
  })

  it('should update the visitor contact details, create a claim event and insert two claim notifications', function () {
    return updateVisitorContactDetails(REFERENCE, eligibilityId, claimId, NEW_EMAIL_ADDRESS, NEW_PHONE_NUMBER, OLD_EMAIL_ADDRESS, OLD_PHONE_NUMBER, CASEWORKER)
      .then(function () {
        return getVisitor(eligibilityId)
          .then(function (visitor) {
            expect(visitor.EmailAddress).to.equal(NEW_EMAIL_ADDRESS)
            expect(visitor.PhoneNumber).to.equal(NEW_PHONE_NUMBER)
            expect(stubInsertClaimEvent.calledOnce).to.be.true //eslint-disable-line
            expect(stubInsertTaskSendClaimNotification.calledTwice).to.be.true //eslint-disable-line
          })
      })
  })

  after(function () {
    return databaseHelper.deleteAll(REFERENCE)
  })
})

function getVisitor (eligibilityId) {
  return knex('IntSchema.Visitor').first()
    .where('EligibilityId', eligibilityId)
}
