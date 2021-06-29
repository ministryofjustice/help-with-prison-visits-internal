var expect = require('chai').expect
const dateFormatter = require('../../../../app/services/date-formatter')
var { insertTestData, insertClaim, deleteAll } = require('../../../helpers/database-setup-for-tests')

var getOverpaidClaimsByReference = require('../../../../app/services/data/get-overpaid-claims-by-reference')
var reference = 'V123456'
var claimId1
var claimId2
var claimId3

describe('services/data/get-overpaid-claims-by-reference', function () {
  describe('module', function () {
    before(function () {
      var date = dateFormatter.now().toDate()
      var twoWeeksAgo = dateFormatter.now().subtract(14, 'days').toDate()
      return insertTestData(reference, date, 'Test')
        .then(function (ids) {
          var eligibilityId = ids.eligibilityId
          claimId1 = ids.claimId
          claimId2 = ids.claimId + 1
          claimId3 = ids.claimId + 2

          return insertClaim(claimId2, eligibilityId, reference, twoWeeksAgo, 'APPROVED', true, 50)
            .then(function () {
              return insertClaim(claimId3, eligibilityId, reference, twoWeeksAgo, 'APPROVED', false)
            })
        })
    })

    it('should return any previous claims marked as unpaid', function () {
      return getOverpaidClaimsByReference(reference, claimId1)
        .then(function (result) {
          expect(result).to.have.lengthOf(1)
          expect(result[0].ClaimId).to.equal(claimId2)
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
