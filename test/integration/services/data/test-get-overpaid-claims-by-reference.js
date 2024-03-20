const dateFormatter = require('../../../../app/services/date-formatter')
const { insertTestData, insertClaim, deleteAll } = require('../../../helpers/database-setup-for-tests')

const getOverpaidClaimsByReference = require('../../../../app/services/data/get-overpaid-claims-by-reference')
const reference = 'V123456'
let claimId1
let claimId2
let claimId3

describe('services/data/get-overpaid-claims-by-reference', function () {
  describe('module', function () {
    beforeAll(function () {
      const date = dateFormatter.now().toDate()
      const twoWeeksAgo = dateFormatter.now().subtract(14, 'days').toDate()
      let eligibilityId
      return insertTestData(reference, date, 'Test')
        .then(function (ids) {
          eligibilityId = ids.eligibilityId
          claimId1 = ids.claimId
          claimId2 = ids.claimId + 1
          claimId3 = ids.claimId + 2

          return insertClaim(claimId2, eligibilityId, reference, twoWeeksAgo, 'APPROVED', true, 50)
        })
        .then(function () {
          return insertClaim(claimId3, eligibilityId, reference, twoWeeksAgo, 'APPROVED', false)
        })
    })

    it('should return any previous claims marked as unpaid', function () {
      return getOverpaidClaimsByReference(reference, claimId1)
        .then(function (result) {
          expect(result).toHaveLength(1)
          expect(result[0].ClaimId).toBe(claimId2)
        })
        .catch(function (error) {
          throw error
        });
    })

    afterAll(function () {
      return deleteAll(reference)
    })
  })
})
