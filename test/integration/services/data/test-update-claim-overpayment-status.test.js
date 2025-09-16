/* eslint-env mocha */
const dateFormatter = require('../../../../app/services/date-formatter')
const { insertTestData, deleteAll, db } = require('../../../helpers/database-setup-for-tests')

const updateClaimOverpaymentStatus = require('../../../../app/services/data/update-claim-overpayment-status')
const overpaymentActionEnum = require('../../../../app/constants/overpayment-action-enum')

let date
const reference = 'OVERPAY'
let claimId
let previousLastUpdated

describe('services/data/test-update-claim-overpayment-status', () => {
  beforeEach(() => {
    date = dateFormatter.now().toDate()
    return insertTestData(reference, date, 'Test').then(function (ids) {
      claimId = ids.claimId
      previousLastUpdated = ids.previousLastUpdated
    })
  })

  it(`should mark a non-overpaid claim as overpaid (${overpaymentActionEnum.OVERPAID})`, () => {
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
      .then(() => {
        return db('Claim').first().where('ClaimId', claimId)
      })
      .then(claim => {
        claimAfter = claim

        return db('ClaimEvent').orderBy('DateAdded', 'desc').first().where('ClaimId', claimId)
      })
      .then(function (claimEvent) {
        expect(claimAfter.IsOverpaid).toBe(true)
        expect(claimAfter.OverpaymentAmount.toString()).toBe(amount)
        expect(claimAfter.OverpaymentReason).toBe(reason)
        expect(claimAfter.LastUpdated).not.toBe(previousLastUpdated)
        expect(claimEvent.Event).toBe(overpaymentActionEnum.OVERPAID)
      })
  })

  it(`should update remaining amount for overpayment (${overpaymentActionEnum.UPDATE})`, () => {
    const remaining = '25'
    const reason = 'Test Reason'
    let claimAfter
    let claimBefore

    return db('Claim').where('ClaimId', claimId).update({ IsOverpaid: true })
      .then(() => {
        return db('Claim').first().where('ClaimId', claimId)
      })
      .then(claim => {
        const overpaymentResponse = {
          action: overpaymentActionEnum.UPDATE,
          remaining,
          amount: '',
          reason
        }

        claimBefore = claim

        return updateClaimOverpaymentStatus(claimBefore, overpaymentResponse)
      })
      .then(() => {
        return db('Claim').first().where('ClaimId', claimId)
      })
      .then(claim => {
        claimAfter = claim

        return db('ClaimEvent').orderBy('DateAdded', 'desc').first().where('ClaimId', claimId)
      })
      .then(function (claimEvent) {
        expect(claimAfter.IsOverpaid).toBe(true)
        expect(claimAfter.RemainingOverpaymentAmount.toString()).toBe(remaining)
        expect(claimAfter.OverpaymentAmount).toBe(claimBefore.OverpaymentAmount)
        expect(claimAfter.OverpaymentReason).not.toBe(reason)
        expect(claimAfter.LastUpdated).not.toBe(previousLastUpdated)
        expect(claimEvent.Note).toEqual(expect.arrayContaining([
          `Previous remaining amount: £${Number(claimBefore.RemainingOverpaymentAmount).toFixed(2)}`
        ]))
        expect(claimEvent.Note).toEqual(
          expect.arrayContaining([`New remaining amount: £${Number(remaining).toFixed(2)}`])
        )
        expect(claimEvent.Note).toEqual(expect.arrayContaining([reason]))
        expect(claimEvent.Event).toBe(overpaymentActionEnum.UPDATE)
      })
  })

  it(`should mark an overpaid claim as no longer overpaid (${overpaymentActionEnum.RESOLVE})`, () => {
    const remaining = '0'
    const reason = 'Test Reason'
    let claimAfter
    let claimBefore

    return db('Claim').where('ClaimId', claimId).update({ IsOverpaid: true })
      .then(() => {
        return db('Claim').first().where('ClaimId', claimId)
      })
      .then(claim => {
        const overpaymentResponse = {
          action: overpaymentActionEnum.RESOLVE,
          remaining,
          amount: '',
          reason
        }

        claimBefore = claim

        return updateClaimOverpaymentStatus(claimBefore, overpaymentResponse)
      })
      .then(() => {
        return db('Claim').first().where('ClaimId', claimId)
      })
      .then(claim => {
        claimAfter = claim

        return db('ClaimEvent').orderBy('DateAdded', 'desc').first().where('ClaimId', claimId)
      })
      .then(function (claimEvent) {
        expect(claimAfter.IsOverpaid).toBe(false)
        expect(claimAfter.RemainingOverpaymentAmount.toString()).toBe(remaining)
        expect(claimAfter.OverpaymentAmount).toBe(claimBefore.OverpaymentAmount)
        expect(claimAfter.OverpaymentReason).not.toBe(reason)
        expect(claimAfter.LastUpdated).not.toBe(previousLastUpdated)
        expect(claimEvent.Note).toEqual(expect.arrayContaining([reason]))
        expect(claimEvent.Event).toBe(overpaymentActionEnum.RESOLVE)
      })
  })

  afterEach(() => {
    return deleteAll(reference)
  })
})
