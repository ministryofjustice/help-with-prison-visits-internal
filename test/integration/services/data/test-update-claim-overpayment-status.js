const expect = require('chai').expect
const config = require('../../../../knexfile').migrations
const knex = require('knex')(config)
const moment = require('moment')
const databaseHelper = require('../../../helpers/database-setup-for-tests')

const updateClaimOverpaymentStatus = require('../../../../app/services/data/update-claim-overpayment-status')

var date
var reference = 'OVERPAY'
var claimId

describe('services/data/test-update-claim-overpayment-status', function () {
  before(function () {
    date = moment().toDate()
    return databaseHelper.insertTestData(reference, date, 'Test').then(function (ids) {
      claimId = ids.claimId
    })
  })

  it('should set IsOverpaid to true, and set OverpaymentAmount', function () {
    var isOverpaid = true
    var amount = '10'

    return knex('IntSchema.Claim').first().where('ClaimId', claimId)
      .then(function (claimBefore) {
        var overpaymentResponse = {
          isOverpaid: isOverpaid,
          amount: amount,
          reason: 'reason'
        }

        return updateClaimOverpaymentStatus(claimBefore, overpaymentResponse)
          .then(function () {
            return knex('IntSchema.Claim').first().where('ClaimId', claimId)
              .then(function (claimAfter) {
                return knex('IntSchema.ClaimEvent').orderBy('DateAdded', 'desc').first().where('ClaimId', claimId)
                  .then(function (claimEvent) {
                    expect(claimAfter.IsOverpaid).to.equal(isOverpaid)
                    expect(claimAfter.OverpaymentAmount.toString()).to.equal(amount)
                    expect(claimAfter.OverpaymentReason).to.equal(overpaymentResponse.reason)
                    expect(claimEvent.Event).to.equal('OVERPAID-CLAIM')
                  })
              })
          })
      })
  })

  it('should set IsOverpaid to false', function () {
    var isOverpaid = false

    return knex('IntSchema.Claim').first().where('ClaimId', claimId)
      .then(function (claimBefore) {
        var overpaymentResponse = {
          isOverpaid: isOverpaid
        }

        return updateClaimOverpaymentStatus(claimBefore, overpaymentResponse)
          .then(function () {
            return knex('IntSchema.Claim').first().where('ClaimId', claimId)
              .then(function (claimAfter) {
                return knex('IntSchema.ClaimEvent').orderBy('DateAdded', 'desc').first().where('ClaimId', claimId)
                  .then(function (claimEvent) {
                    expect(claimAfter.IsOverpaid).to.equal(isOverpaid)
                    expect(claimEvent.Event).to.equal('OVERPAID-CLAIM-RESOLVED')
                  })
              })
          })
      })
  })

  after(function () {
    return databaseHelper.deleteAll(reference)
  })
})
