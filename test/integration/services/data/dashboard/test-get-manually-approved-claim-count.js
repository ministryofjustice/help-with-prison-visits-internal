const expect = require('chai').expect
const moment = require('moment')
const dateFormatter = require('../../../../../app/services/date-formatter')
const { insertTestData, insertClaim, deleteAll } = require('../../../../helpers/database-setup-for-tests')

const getManuallyApprovedClaimCount = require('../../../../../app/services/data/dashboard/get-manually-approved-claim-count')
const claimStatusEnum = require('../../../../../app/constants/claim-status-enum')
const dashboardFilterEnum = require('../../../../../app/constants/dashboard-filter-enum')

var reference = 'MANUAL'
var claimId2
var claimId3
var claimId4
var claimId5
var claimId6
var claimId7
var claimId8
var claimId9
var claimId10

var date = dateFormatter.now().toDate()
var yesterday = dateFormatter.now().subtract(1, 'days').toDate()
var lastWeek = dateFormatter.now().subtract(7, 'days').toDate()
var oneMonthAgo = dateFormatter.now().subtract(1, 'months').toDate()
var twoMonthsAgo = dateFormatter.now().subtract(2, 'months').toDate()
var threeMonthsAgo = dateFormatter.now().subtract(3, 'months').toDate()
var fourMonthsAgo = dateFormatter.now().subtract(4, 'months').toDate()

var todayCount
var yesterdayCount
var last7DaysCount
var oneMonthAgoCount
var twoMonthsAgoCount
var threeMonthsAgoCount
var fourMonthsAgoCount

describe('services/data/dashboard/get-manually-approved-claim-count', function () {
  describe('module', function () {
    before(function () {
      return getCountsBeforeTest()
        .then(function () {
          return insertTestData(reference, date, claimStatusEnum.APPROVED.value)
        })
        .then(function (ids) {
          var eligibilityId = ids.eligibilityId
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

          promises.push(insertClaim(claimId2, eligibilityId, reference, yesterday, claimStatusEnum.APPROVED.value, false))
          promises.push(insertClaim(claimId3, eligibilityId, reference, lastWeek, claimStatusEnum.APPROVED.value, false))
          promises.push(insertClaim(claimId4, eligibilityId, reference, oneMonthAgo, claimStatusEnum.APPROVED.value, false))
          promises.push(insertClaim(claimId5, eligibilityId, reference, twoMonthsAgo, claimStatusEnum.APPROVED.value, false))
          promises.push(insertClaim(claimId6, eligibilityId, reference, threeMonthsAgo, claimStatusEnum.APPROVED.value, false))
          promises.push(insertClaim(claimId7, eligibilityId, reference, fourMonthsAgo, claimStatusEnum.APPROVED.value, false))
          promises.push(insertClaim(claimId8, eligibilityId, reference, yesterday, claimStatusEnum.AUTOAPPROVED.value, false))
          promises.push(insertClaim(claimId9, eligibilityId, reference, oneMonthAgo, claimStatusEnum.REJECTED.value, false))
          promises.push(insertClaim(claimId10, eligibilityId, reference, threeMonthsAgo, claimStatusEnum.PENDING.value, false))

          return Promise.all(promises)
        })
    })

    it('should return the correct number of manually Approved claims submitted today', function () {
      var expectedResult = todayCount + 1
      return checkCount(dashboardFilterEnum.TODAY, expectedResult)
    })

    it('should return the correct number of manually Approved claims submitted yesterday', function () {
      var expectedResult = yesterdayCount + 1
      return checkCount(dashboardFilterEnum.YESTERDAY, expectedResult)
    })

    it('should return the correct number of manually Approved claims submitted in the last 7 days', function () {
      var expectedResult = last7DaysCount + 3
      return checkCount(dashboardFilterEnum.LAST_7_DAYS, expectedResult)
    })

    it('should return the correct number of manually Approved claims submitted in the previous calendar month', function () {
      // Need to amend expected count if test is run before the 7th of the month,
      // because yesterday and last week could potentially be in the previous calendar month
      var expectedResult = oneMonthAgoCount + 1

      if (moment(yesterday).isSame(oneMonthAgo, 'month')) {
        expectedResult++
      }

      if (moment(lastWeek).isSame(oneMonthAgo, 'month')) {
        expectedResult++
      }

      return checkCount(dashboardFilterEnum.ONE_MONTH_AGO, expectedResult)
    })

    it('should return the correct number of manually Approved claims submitted in the calendar month before the previous month', function () {
      var expectedResult = twoMonthsAgoCount + 1
      return checkCount(dashboardFilterEnum.TWO_MONTHS_AGO, expectedResult)
    })

    it('should return the correct number of manually Approved claims submitted in the calendar month 3 months ago', function () {
      var expectedResult = threeMonthsAgoCount + 1
      return checkCount(dashboardFilterEnum.THREE_MONTHS_AGO, expectedResult)
    })

    it('should return the correct number of manually Approved claims submitted in the calendar month 4 months ago', function () {
      var expectedResult = fourMonthsAgoCount + 1
      return checkCount(dashboardFilterEnum.FOUR_MONTHS_AGO, expectedResult)
    })

    after(function () {
      return deleteAll(reference)
    })
  })
})

function checkCount (filter, expectedCount) {
  return getManuallyApprovedClaimCount(filter)
    .then(function (result) {
      expect(result[0].Count).to.equal(expectedCount)
    })
    .catch(function (error) {
      throw error
    })
}

function getCountsBeforeTest () {
  var promises = []

  promises.push(getManuallyApprovedClaimCount(dashboardFilterEnum.TODAY).then(function (result) { todayCount = result[0].Count }))
  promises.push(getManuallyApprovedClaimCount(dashboardFilterEnum.YESTERDAY).then(function (result) { yesterdayCount = result[0].Count }))
  promises.push(getManuallyApprovedClaimCount(dashboardFilterEnum.LAST_7_DAYS).then(function (result) { last7DaysCount = result[0].Count }))
  promises.push(getManuallyApprovedClaimCount(dashboardFilterEnum.ONE_MONTH_AGO).then(function (result) { oneMonthAgoCount = result[0].Count }))
  promises.push(getManuallyApprovedClaimCount(dashboardFilterEnum.TWO_MONTHS_AGO).then(function (result) { twoMonthsAgoCount = result[0].Count }))
  promises.push(getManuallyApprovedClaimCount(dashboardFilterEnum.THREE_MONTHS_AGO).then(function (result) { threeMonthsAgoCount = result[0].Count }))
  promises.push(getManuallyApprovedClaimCount(dashboardFilterEnum.FOUR_MONTHS_AGO).then(function (result) { fourMonthsAgoCount = result[0].Count }))

  return Promise.all(promises)
}
