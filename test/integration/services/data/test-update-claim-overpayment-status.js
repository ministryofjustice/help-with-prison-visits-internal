/* eslint-env mocha */
const expect = require('chai').expect
const dateFormatter = require('../../../../app/services/date-formatter')
const { insertTestData, deleteAll, db } = require('../../../helpers/database-setup-for-tests')

const updateClaimOverpaymentStatus = require('../../../../app/services/data/update-claim-overpayment-status')
const overpaymentActionEnum = require('../../../../app/constants/overpayment-action-enum')

let date
const reference = 'OVERPAY'
let claimId
let previousLastUpdated

describe('services/data/test-update-claim-overpayment-status', function () {
  beforeEach(function () {
    date = dateFormatter.now().toDate()
    return insertTestData(reference, date, 'Test').then(function (ids) {
      claimId = ids.claimId
      previousLastUpdated = ids.previousLastUpdated
    })
  })

  it(`should mark a non-overpaid claim as overpaid (${overpaymentActionEnum.OVERPAID})`, function () {
    const amount = '50'
    const reason = 'Test Reason'
    let claimAfter

    return db('Claim').first().where('ClaimId', claimId)
      .then(function (claimBefore) {
        const overpaymentResponse = {
          action: overpaymentActionEnum.OVERPAID,
          amount,
          remaining: amount,
          reason
        }

        return updateClaimOverpaymentStatus(claimBefore, overpaymentResponse)
      })
      .then(function () {
        return db('Claim').first().where('ClaimId', claimId)
      })
      .then(function (claim) {
        claimAfter = claim

        return db('ClaimEvent').orderBy('DateAdded', 'desc').first().where('ClaimId', claimId)
      })
      .then(function (claimEvent) {
        expect(claimAfter.IsOverpaid).to.be.true //eslint-disable-line
        expect(claimAfter.OverpaymentAmount.toString()).to.equal(amount)
        expect(claimAfter.OverpaymentReason).to.equal(reason)
        expect(claimAfter.LastUpdated).to.not.equal(previousLastUpdated)
        expect(claimEvent.Event).to.equal(overpaymentActionEnum.OVERPAID)
      })
  })

  it(`should update remaining amount for overpayment (${overpaymentActionEnum.UPDATE})`, function () {
    const remaining = '25'
    const reason = 'Test Reason'
    let claimAfter
    let claimBefore

    return db('Claim').where('ClaimId', claimId).update({ IsOverpaid: true })
      .then(function () {
        return db('Claim').first().where('ClaimId', claimId)
      })
      .then(function (claim) {
        const overpaymentResponse = {
          action: overpaymentActionEnum.UPDATE,
          remaining,
          amount: '',
          reason
        }

        claimBefore = claim

        return updateClaimOverpaymentStatus(claimBefore, overpaymentResponse)
      })
      .then(function () {
        return db('Claim').first().where('ClaimId', claimId)
      })
      .then(function (claim) {
        claimAfter = claim

        return db('ClaimEvent').orderBy('DateAdded', 'desc').first().where('ClaimId', claimId)
      })
      .then(function (claimEvent) {
        expect(claimAfter.IsOverpaid).to.be.true //eslint-disable-line
        expect(claimAfter.RemainingOverpaymentAmount.toString()).to.equal(remaining)
        expect(claimAfter.OverpaymentAmount).to.be.equal(claimBefore.OverpaymentAmount)
        expect(claimAfter.OverpaymentReason).to.not.equal(reason)
        expect(claimAfter.LastUpdated).to.not.equal(previousLastUpdated)
        expect(claimEvent.Note).to.contain(`Previous remaining amount: £${Number(claimBefore.RemainingOverpaymentAmount).toFixed(2)}`)
        expect(claimEvent.Note).to.contain(`New remaining amount: £${Number(remaining).toFixed(2)}`)
        expect(claimEvent.Note).to.contain(reason)
        expect(claimEvent.Event).to.equal(overpaymentActionEnum.UPDATE)
      })
  })

  it(`should mark an overpaid claim as no longer overpaid (${overpaymentActionEnum.RESOLVE})`, function () {
    const remaining = '0'
    const reason = 'Test Reason'
    let claimAfter
    let claimBefore

    return db('Claim').where('ClaimId', claimId).update({ IsOverpaid: true })
      .then(function () {
        return db('Claim').first().where('ClaimId', claimId)
      })
      .then(function (claim) {
        const overpaymentResponse = {
          action: overpaymentActionEnum.RESOLVE,
          remaining,
          amount: '',
          reason
        }

        claimBefore = claim

        return updateClaimOverpaymentStatus(claimBefore, overpaymentResponse)
      })
      .then(function () {
        return db('Claim').first().where('ClaimId', claimId)
      })
      .then(function (claim) {
        claimAfter = claim

        return db('ClaimEvent').orderBy('DateAdded', 'desc').first().where('ClaimId', claimId)
      })
      .then(function (claimEvent) {
        expect(claimAfter.IsOverpaid).to.be.false //eslint-disable-line
        expect(claimAfter.RemainingOverpaymentAmount.toString()).to.equal(remaining)
        expect(claimAfter.OverpaymentAmount).to.be.equal(claimBefore.OverpaymentAmount)
        expect(claimAfter.OverpaymentReason).to.not.equal(reason)
        expect(claimAfter.LastUpdated).to.not.equal(previousLastUpdated)
        expect(claimEvent.Note).to.contain(reason)
        expect(claimEvent.Event).to.equal(overpaymentActionEnum.RESOLVE)
      })
  })

  afterEach(function () {
    return deleteAll(reference)
  })
})
