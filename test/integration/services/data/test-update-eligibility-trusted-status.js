const expect = require('chai').expect
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const { insertTestData, deleteAll, db } = require('../../../helpers/database-setup-for-tests')
const dateFormatter = require('../../../../app/services/date-formatter')

const sandbox = sinon.createSandbox()
const stubInsertClaimEvent = sandbox.stub().resolves()

const updateEligibilityTrustedStatus = proxyquire('../../../../app/services/data/update-eligibility-trusted-status', {
  './insert-claim-event': stubInsertClaimEvent
})

const REFERENCE_ONE = 'REF12345'
const REFERENCE_TWO = 'REF67891'

let eligibilityId1
let eligibilityId2
let claimId1
let claimId2

describe('services/data/update-eligibility-trusted-status', function () {
  beforeEach(function () {
    sandbox.reset()
  })

  before(function () {
    return insertTestData(REFERENCE_ONE, dateFormatter.now().toDate(), 'Test').then(function (ids) {
      claimId1 = ids.claimId
      eligibilityId1 = ids.eligibilityId

      return insertTestData(REFERENCE_TWO, dateFormatter.now().toDate(), 'Test', dateFormatter.now().toDate(), 10)
    })
      .then(function (ids2) {
        claimId2 = ids2.claimId
        eligibilityId2 = ids2.eligibilityId
      })
  })

  it('should set the eligibility to untrusted and create a claim event', function () {
    const isTrusted = false
    const untrustedReason = 'untrusted reason'

    return setEligibilityTrusted(eligibilityId1, true)
      .then(function () {
        return updateEligibilityTrustedStatus(claimId1, isTrusted, untrustedReason)
      })
      .then(function () {
        return getEligibility(eligibilityId1)
      })
      .then(function (eligibility) {
        expect(eligibility.IsTrusted).to.equal(isTrusted)
        expect(eligibility.UntrustedReason).to.equal(untrustedReason)
        expect(eligibility.UntrustedDate).to.not.be.null //eslint-disable-line
        expect(stubInsertClaimEvent.calledOnce).to.be.true //eslint-disable-line
      })
  })

  it('should set the eligibility to trusted and create a claim event', function () {
    const untrustedReason = ''
    const isTrusted = true

    return setEligibilityTrusted(eligibilityId1, false)
      .then(function () {
        return updateEligibilityTrustedStatus(claimId1, isTrusted, untrustedReason)
      })
      .then(function () {
        return getEligibility(eligibilityId1)
      })
      .then(function (eligibility) {
        expect(eligibility.IsTrusted).to.equal(isTrusted)
        expect(eligibility.UntrustedReason).to.be.null //eslint-disable-line
        expect(eligibility.UntrustedDate).to.be.null //eslint-disable-line
        expect(stubInsertClaimEvent.calledOnce).to.be.true //eslint-disable-line
      })
  })

  it('should do nothing if current and new IsTrusted values are the same', function () {
    return setEligibilityTrusted(eligibilityId2, true)
      .then(function () {
        return updateEligibilityTrustedStatus(claimId2, true, null)
      })
      .then(function () {
        return getEligibility(eligibilityId2)
      })
      .then(function (eligibility) {
        expect(eligibility.IsTrusted).to.equal(true)
        expect(stubInsertClaimEvent.notCalled).to.be.true //eslint-disable-line
      })
  })

  after(function () {
    return Promise.all([
      deleteAll(REFERENCE_ONE),
      deleteAll(REFERENCE_TWO)
    ])
  })
})

function getEligibility (eligibilityId) {
  return db('Eligibility').first()
    .where('EligibilityId', eligibilityId)
}

function setEligibilityTrusted (eligibilityId, isTrusted) {
  return db('Eligibility')
    .where('EligibilityId', eligibilityId)
    .update({
      IsTrusted: isTrusted
    })
}
