var expect = require('chai').expect
var moment = require('moment')
var databaseHelper = require('../../../helpers/database-setup-for-tests')

var getOverpaidClaimsByReference = require('../../../../app/services/data/get-overpaid-claims-by-reference')
var reference = 'V123456'

describe('services/data/get-overpaid-claims-by-reference', function () {
  describe('module', function () {
    before(function () {
      var date = moment().toDate()
      var twoWeeksAgo = moment().subtract(14, 'days').toDate()
      return databaseHelper.insertTestData(reference, date, 'Test')
        .then(function (ids) {
          var eligibilityId = ids.eligibilityId
          var claimId = ids.claimId + 1

          return databaseHelper.insertClaim(claimId, eligibilityId, reference, twoWeeksAgo, 'APPROVED', true, 50)
          .then(function () { return databaseHelper.insertClaim(claimId + 1, eligibilityId, reference, twoWeeksAgo, 'APPROVED', false) })
        })
    })

    it('should return any previous claims marked as unpaid', function () {
      return getOverpaidClaimsByReference(reference)
        .then(function (result) {
          expect(result).to.have.length(1)
        })
        .catch(function (error) {
          throw error
        })
    })

    after(function () {
      return databaseHelper.deleteAll(reference)
    })
  })
})
