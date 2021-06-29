const expect = require('chai').expect
const dateFormatter = require('../../../../app/services/date-formatter')
const { insertTestData, deleteAll, db } = require('../../../helpers/database-setup-for-tests')
const claimStatusEnum = require('../../../../app/constants/claim-status-enum')

const updateClaimStatusRequestingBankDetails = require('../../../../app/services/data/update-claim-status-requesting-bank-details')
var reference = 'NEWBANK'
var date
var previousLastUpdated
var claimId

describe('services/data/update-claim-status-requesting-bank-details', function () {
  describe('module', function () {
    before(function () {
      date = dateFormatter.now()
      return insertTestData(reference, date.toDate(), 'TESTING').then(function (ids) {
        claimId = ids.claimId
        previousLastUpdated = ids.lastUpdated
      })
    })

    it(`should set claim status to ${claimStatusEnum.REQUEST_INFO_PAYMENT.value} and null payment status`, function () {
      return updateClaimStatusRequestingBankDetails(reference, claimId)
        .then(function () {
          return db('Claim').first().where('ClaimId', claimId)
            .then(function (claim) {
              expect(claim.Status).to.equal(claimStatusEnum.REQUEST_INFO_PAYMENT.value)
              expect(claim.PaymentStatus).to.equal(null)
              expect(claim.LastUpdated).to.not.equal(previousLastUpdated)
            })
        })
        .catch(function (error) {
          throw error
        })
    })

    after(function () {
      return deleteAll(reference)
    })
  })
})
