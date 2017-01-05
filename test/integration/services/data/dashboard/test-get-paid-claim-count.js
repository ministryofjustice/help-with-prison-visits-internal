const expect = require('chai').expect
const moment = require('moment')
const databaseHelper = require('../../../../helpers/database-setup-for-tests')

const getPaidClaimCount = require('../../../../../app/services/data/dashboard/get-paid-claim-count')
const claimStatusEnum = require('../../../../../app/constants/claim-status-enum')
const dashboardFilterEnum = require('../../../../../app/constants/dashboard-filter-enum')

var reference = 'PAID'
var claimId1
var claimId2
var claimId3
var claimId4
var claimId5
var claimId6
var claimId7
var claimId8
var claimId9
var claimId10

var date = moment().toDate()
var yesterday = moment().subtract(1, 'days').toDate()
var lastWeek = moment().subtract(7, 'days').toDate()
var oneMonthAgo = moment().subtract(1, 'months').toDate()
var twoMonthsAgo = moment().subtract(2, 'months').toDate()
var threeMonthsAgo = moment().subtract(3, 'months').toDate()
var fourMonthsAgo = moment().subtract(4, 'months').toDate()

describe('services/data/dashboard/get-paid-claim-count', function () {
  describe('module', function () {
    before(function () {
      return databaseHelper.insertTestData(reference, date, claimStatusEnum.AUTOAPPROVED.value)
        .then(function (ids) {
          var eligibilityId = ids.eligibilityId
          claimId1 = ids.claimId
          claimId2 = ids.claimId + 1
          claimId3 = ids.claimId + 2
          claimId4 = ids.claimId + 3
          claimId5 = ids.claimId + 4
          claimId6 = ids.claimId + 5
          claimId7 = ids.claimId + 6
          claimId8 = ids.claimId + 7
          claimId9 = ids.claimId + 8
          claimId10 = ids.claimId + 9

          var promises = []

          promises.push(databaseHelper.insertClaim(claimId2, eligibilityId, reference, yesterday, claimStatusEnum.APPROVED_ADVANCE_CLOSED.value, false, null, null, true))
          promises.push(databaseHelper.insertClaim(claimId3, eligibilityId, reference, lastWeek, claimStatusEnum.AUTOAPPROVED.value, false, null, null, false))
          promises.push(databaseHelper.insertClaim(claimId4, eligibilityId, reference, oneMonthAgo, claimStatusEnum.APPROVED.value, false, null, null, false))
          promises.push(databaseHelper.insertClaim(claimId5, eligibilityId, reference, twoMonthsAgo, claimStatusEnum.APPROVED_ADVANCE_CLOSED.value, false, null, null, true))
          promises.push(databaseHelper.insertClaim(claimId6, eligibilityId, reference, threeMonthsAgo, claimStatusEnum.AUTOAPPROVED.value, false, null, null, false))
          promises.push(databaseHelper.insertClaim(claimId7, eligibilityId, reference, fourMonthsAgo, claimStatusEnum.APPROVED.value, false, null, null, false))
          promises.push(databaseHelper.insertClaim(claimId8, eligibilityId, reference, yesterday, claimStatusEnum.APPROVED_ADVANCE_CLOSED.value, false, null, null, false))
          promises.push(databaseHelper.insertClaim(claimId9, eligibilityId, reference, oneMonthAgo, claimStatusEnum.REJECTED.value, false, null, null, false))
          promises.push(databaseHelper.insertClaim(claimId10, eligibilityId, reference, threeMonthsAgo, claimStatusEnum.PENDING.value, false, null, null, false))

          return Promise.all(promises)
        })
    })

    it('should return the correct total number of Paid claims in the system', function () {
      return checkCount(null, 7)
    })

    it('should return the correct number of Paid claims submitted today', function () {
      return checkCount(dashboardFilterEnum.TODAY, 1)
    })

    it('should return the correct number of Paid claims submitted yesterday', function () {
      return checkCount(dashboardFilterEnum.YESTERDAY, 1)
    })

    it('should return the correct number of Paid claims submitted in the last 7 days', function () {
      return checkCount(dashboardFilterEnum.LAST_WEEK, 3)
    })

    it('should return the correct number of Paid claims submitted in the previous calendar month', function () {
      // Need to amend expected count if test is run before the 7th of the month,
      // because yesterday and last week could potentially be in the previous calendar month
      var expectedResult = 1

      if (moment(yesterday).isSame(oneMonthAgo, 'month')) {
        expectedResult++
      }

      if (moment(lastWeek).isSame(oneMonthAgo, 'month')) {
        expectedResult++
      }

      return checkCount(dashboardFilterEnum.ONE_MONTH_AGO, expectedResult)
    })

    it('should return the correct number of Paid claims submitted in the calendar month before the previous month', function () {
      return checkCount(dashboardFilterEnum.TWO_MONTHS_AGO, 1)
    })

    it('should return the correct number of Paid claims submitted in the calendar month 3 months ago', function () {
      return checkCount(dashboardFilterEnum.THREE_MONTHS_AGO, 1)
    })

    it('should return the correct number of Paid claims submitted in the calendar month 4 months ago', function () {
      return checkCount(dashboardFilterEnum.FOUR_MONTHS_AGO, 1)
    })

    after(function () {
      return databaseHelper.deleteAll(reference)
    })
  })
})

function checkCount (filter, expectedCount) {
  return getPaidClaimCount(filter)
    .then(function (result) {
      expect(result[0].Count).to.equal(expectedCount)
    })
    .catch(function (error) {
      throw error
    })
}
