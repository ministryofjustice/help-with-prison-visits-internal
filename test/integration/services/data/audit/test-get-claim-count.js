const expect = require('chai').expect
const dateFormatter = require('../../../../../app/services/date-formatter')
const { insertTestData, insertClaim, deleteAll } = require('../../../../helpers/database-setup-for-tests')
const claimStatusEnum = require('../../../../../app/constants/claim-status-enum')
const getClaimCount = require('../../../../../app/services/data/audit/get-claim-count')

const reference = 'TEST'
const date = dateFormatter.now().toDate()
const yesterday = dateFormatter.now().subtract(1, 'days').toDate()
const lastWeek = dateFormatter.now().subtract(7, 'days').toDate()
const oneMonthAgo = dateFormatter.now().subtract(1, 'months').toDate()
const twoMonthsAgo = dateFormatter.now().subtract(2, 'months').toDate()
const threeMonthsAgo = dateFormatter.now().subtract(3, 'months').toDate()
const fourMonthsAgo = dateFormatter.now().subtract(4, 'months').toDate()

describe('services/data/audit/get-claim-count', function () {
  describe('module', function () {
    before(function () {
    const promises = []
          promises.push(insertClaim(1231, 12311, reference, yesterday, claimStatusEnum.APPROVED.value, false))
          promises.push(insertClaim(1232, 12322, reference, lastWeek, claimStatusEnum.APPROVED.value, false))
          promises.push(insertClaim(1233, 12333, reference, oneMonthAgo, claimStatusEnum.APPROVED.value, false))
          promises.push(insertClaim(1234, 12344, reference, twoMonthsAgo, claimStatusEnum.APPROVED.value, false, null, null, null, null, true))
          promises.push(insertClaim(1235, 12355, reference, threeMonthsAgo, claimStatusEnum.APPROVED.value, false))
          promises.push(insertClaim(1236, 12366, reference, fourMonthsAgo, claimStatusEnum.APPROVED.value, false))
          promises.push(insertClaim(1237, 12377, reference, yesterday, claimStatusEnum.AUTOAPPROVED.value, false))
          promises.push(insertClaim(1238, 12388, reference, oneMonthAgo, claimStatusEnum.REJECTED.value, false))
          promises.push(insertClaim(1239, 12399, reference, threeMonthsAgo, claimStatusEnum.PENDING.value, false))
          return Promise.all(promises)
    })

    it('should return the correct number of claim between today and 5 months ago', function () {
      const fiveMonthsAgo = dateFormatter.now().subtract(5, 'months')
      return getCount(fiveMonthsAgo, dateFormatter.now(), 5)
    })

    it('should return the correct number of claim between today and 2 months ago', function () {
      const twoMonthsAgo = dateFormatter.now().subtract(2, 'months')
      return getCount(twoMonthsAgo, dateFormatter.now(), 3)
    })

    after(function () {
      return deleteAll(reference)
    })
  })
})

function getCount (startDate, endDate, expectedCount) {
  return getClaimCount(startDate, endDate)
    .then(function (result) {
      expect(result[0].Count).to.equal(expectedCount)
    })
    .catch(function (error) {
      throw error
    })
}