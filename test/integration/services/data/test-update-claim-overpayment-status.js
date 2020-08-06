/* eslint-env mocha */
const expect = require('chai').expect
const config = require('../../../../knexfile').migrations
const knex = require('knex')(config)
const dateFormatter = require('../../../../app/services/date-formatter')
const databaseHelper = require('../../../helpers/database-setup-for-tests')

const updateClaimOverpaymentStatus = require('../../../../app/services/data/update-claim-overpayment-status')
const overpaymentActionEnum = require('../../../../app/constants/overpayment-action-enum')

var date
var reference = 'OVERPAY'
var claimId
var previousLastUpdated

describe('services/data/test-update-claim-overpayment-status', function () {
  beforeEach(function () {
    date = dateFormatter.now().toDate()
    return databaseHelper.insertTestData(reference, date, 'Test').then(function (ids) {
      claimId = ids.claimId
      previousLastUpdated = ids.previousLastUpdated
    })
  })

  it(`should mark a non-overpaid claim as overpaid (${overpaymentActionEnum.OVERPAID})`, function () {
    var amount = '50'
    var reason = 'Test Reason'

    return knex('IntSchema.Claim').first().where('ClaimId', claimId)
      .then(function (claimBefore) {
        var overpaymentResponse = {
          action: overpaymentActionEnum.OVERPAID,
          amount: amount,
          remaining: amount,
          reason: reason
        }

        return updateClaimOverpaymentStatus(claimBefore, overpaymentResponse)
          .then(function () {
            return knex('IntSchema.Claim').first().where('ClaimId', claimId)
              .then(function (claimAfter) {
                return knex('IntSchema.ClaimEvent').orderBy('DateAdded', 'desc').first().where('ClaimId', claimId)
                  .then(function (claimEvent) {
                    expect(claimAfter.IsOverpaid).to.be.true //eslint-disable-line
                    expect(claimAfter.OverpaymentAmount.toString()).to.equal(amount)
                    expect(claimAfter.OverpaymentReason).to.equal(reason)
                    expect(claimAfter.LastUpdated).to.not.equal(previousLastUpdated)
                    expect(claimEvent.Event).to.equal(overpaymentActionEnum.OVERPAID)
                  })
              })
          })
      })
  })

  it(`should update remaining amount for overpayment (${overpaymentActionEnum.UPDATE})`, function () {
    var remaining = '25'
    var reason = 'Test Reason'

    return knex('Claim').where('ClaimId', claimId).update({ IsOverpaid: true })
      .then(function () {
        return knex('IntSchema.Claim').first().where('ClaimId', claimId)
          .then(function (claimBefore) {
            var overpaymentResponse = {
              action: overpaymentActionEnum.UPDATE,
              remaining: remaining,
              amount: '',
              reason: reason
            }

            return updateClaimOverpaymentStatus(claimBefore, overpaymentResponse)
              .then(function () {
                return knex('IntSchema.Claim').first().where('ClaimId', claimId)
                  .then(function (claimAfter) {
                    return knex('IntSchema.ClaimEvent').orderBy('DateAdded', 'desc').first().where('ClaimId', claimId)
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
              })
          })
      })
  })

  it(`should mark an overpaid claim as no longer overpaid (${overpaymentActionEnum.RESOLVE})`, function () {
    var remaining = '0'
    var reason = 'Test Reason'

    return knex('Claim').where('ClaimId', claimId).update({ IsOverpaid: true })
      .then(function () {
        return knex('IntSchema.Claim').first().where('ClaimId', claimId)
          .then(function (claimBefore) {
            var overpaymentResponse = {
              action: overpaymentActionEnum.RESOLVE,
              remaining: remaining,
              amount: '',
              reason: reason
            }

            return updateClaimOverpaymentStatus(claimBefore, overpaymentResponse)
              .then(function () {
                return knex('IntSchema.Claim').first().where('ClaimId', claimId)
                  .then(function (claimAfter) {
                    return knex('IntSchema.ClaimEvent').orderBy('DateAdded', 'desc').first().where('ClaimId', claimId)
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
              })
          })
      })
  })

  afterEach(function () {
    return databaseHelper.deleteAll(reference)
  })
})
