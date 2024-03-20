const dateFormatter = require('../../../../../app/services/date-formatter')
const {
  insertClaim,
  deleteAll
} = require('../../../../helpers/database-setup-for-tests')
const claimStatusEnum = require('../../../../../app/constants/claim-status-enum')
const getClaimsDataBelowThreshold = require('../../../../../app/services/data/audit/get-all-claims-data-below-threshold')

const reference = 'TEST'
const yesterday = dateFormatter.now().subtract(1, 'days').toDate()
const lastWeek = dateFormatter.now().subtract(7, 'days').toDate()
const oneMonthAgo = dateFormatter.now().subtract(1, 'months').toDate()
const twoMonthsAgo = dateFormatter.now().subtract(2, 'months').toDate()
const threeMonthsAgo = dateFormatter.now().subtract(3, 'months').toDate()
const fourMonthsAgo = dateFormatter.now().subtract(4, 'months').toDate()

describe('services/data/audit/get-all-claims-data-below-threshold', function () {
  describe('module', function () {
    beforeAll(function () {
      const promises = []
      promises.push(insertClaim(1231, 12311, reference, yesterday, claimStatusEnum.APPROVED.value, false, null, null, null, null, false, 49))
      promises.push(insertClaim(1232, 12322, reference, lastWeek, claimStatusEnum.APPROVED.value, false, null, null, null, null, false, 100))
      promises.push(insertClaim(1233, 12333, reference, oneMonthAgo, claimStatusEnum.APPROVED.value, false, null, null, null, null, false, 25))
      promises.push(insertClaim(1234, 12344, reference, twoMonthsAgo, claimStatusEnum.APPROVED.value, false, null, null, null, null, true, 89))
      promises.push(insertClaim(1235, 12355, reference, threeMonthsAgo, claimStatusEnum.APPROVED.value, false, null, null, null, null, false, 65))
      promises.push(insertClaim(1236, 12366, reference, fourMonthsAgo, claimStatusEnum.APPROVED.value, false, null, null, null, null, false, 102))
      return Promise.all(promises)
    })

    it('should return the correct data between today and 5 months ago for given threshold and percent', function () {
      const fiveMonthsAgo = dateFormatter.now().subtract(5, 'months')
      const expectedResult = [{ Reference: 'TEST', ClaimId: 1231, PaymentAmount: 49, Caseworker: null }, { Reference: 'TEST', ClaimId: 1233, PaymentAmount: 25, Caseworker: null }, { Reference: 'TEST', ClaimId: 1235, PaymentAmount: 65, Caseworker: null }]
      return getClaimData(fiveMonthsAgo, dateFormatter.now(), 100, 80, expectedResult)
    })

    it('should return the correct number of claim between today and 2 months ago for given threshold and percent', function () {
      const expectedResult = [{ Reference: 'TEST', ClaimId: 1231, PaymentAmount: 49, Caseworker: null }, { Reference: 'TEST', ClaimId: 1232, PaymentAmount: 100, Caseworker: null }, { Reference: 'TEST', ClaimId: 1233, PaymentAmount: 25, Caseworker: null }]
      const twoMonthsAgo = dateFormatter.now().subtract(2, 'months')
      return getClaimData(twoMonthsAgo, dateFormatter.now(), 100, 100, expectedResult)
    })

    afterAll(function () {
      return deleteAll(reference)
    })
  })
})

function getClaimData (startDate, endDate, percent, threshold, expectedResult) {
  return getClaimsDataBelowThreshold(startDate, endDate, percent, threshold)
    .then(function (result) {
      expect(JSON.stringify(result)).toBe(JSON.stringify(expectedResult))
    })
    .catch(function (error) {
      throw error
    });
}
