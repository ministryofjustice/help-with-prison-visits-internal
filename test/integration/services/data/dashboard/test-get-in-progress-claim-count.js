const expect = require('chai').expect
const moment = require('moment')
const dateFormatter = require('../../../../../app/services/date-formatter')
const { insertTestData, insertClaim, deleteAll } = require('../../../../helpers/database-setup-for-tests')

const getInProgressClaimCount = require('../../../../../app/services/data/dashboard/get-in-progress-claim-count')
const claimStatusEnum = require('../../../../../app/constants/claim-status-enum')
const dashboardFilterEnum = require('../../../../../app/constants/dashboard-filter-enum')

const reference = 'INPROGRESS'
let claimId2
let claimId3
let claimId4
let claimId5
let claimId6
let claimId7
let claimId8
let claimId9
let claimId10

const date = dateFormatter.now().toDate()
const yesterday = dateFormatter.now().subtract(1, 'days').toDate()
const lastWeek = dateFormatter.now().subtract(7, 'days').toDate()
const oneMonthAgo = dateFormatter.now().subtract(1, 'months').toDate()
const twoMonthsAgo = dateFormatter.now().subtract(2, 'months').toDate()
const threeMonthsAgo = dateFormatter.now().subtract(3, 'months').toDate()
const fourMonthsAgo = dateFormatter.now().subtract(4, 'months').toDate()

let todayCount
let yesterdayCount
let last7DaysCount
let oneMonthAgoCount
let twoMonthsAgoCount
let threeMonthsAgoCount
let fourMonthsAgoCount

describe('services/data/dashboard/get-in-progress-claim-count', function () {
  describe('module', function () {
    before(function () {
      return getCountsBeforeTest()
        .then(function () {
          return insertTestData(reference, date, claimStatusEnum.NEW.value)
        })
        .then(function (ids) {
          const eligibilityId = ids.eligibilityId
          claimId2 = ids.claimId + 1
          claimId3 = ids.claimId + 2
          claimId4 = ids.claimId + 3
          claimId5 = ids.claimId + 4
          claimId6 = ids.claimId + 5
          claimId7 = ids.claimId + 6
          claimId8 = ids.claimId + 7
          claimId9 = ids.claimId + 8
          claimId10 = ids.claimId + 9

          const promises = []

          promises.push(insertClaim(claimId2, eligibilityId, reference, yesterday, claimStatusEnum.NEW.value, false))
          promises.push(insertClaim(claimId3, eligibilityId, reference, lastWeek, claimStatusEnum.UPDATED.value, false))
          promises.push(insertClaim(claimId4, eligibilityId, reference, oneMonthAgo, claimStatusEnum.REQUEST_INFORMATION.value, false))
          promises.push(insertClaim(claimId5, eligibilityId, reference, twoMonthsAgo, claimStatusEnum.REQUEST_INFO_PAYMENT.value, false))
          promises.push(insertClaim(claimId6, eligibilityId, reference, threeMonthsAgo, claimStatusEnum.NEW.value, false))
          promises.push(insertClaim(claimId7, eligibilityId, reference, fourMonthsAgo, claimStatusEnum.UPDATED.value, false))
          promises.push(insertClaim(claimId8, eligibilityId, reference, yesterday, claimStatusEnum.APPROVED.value, false))
          promises.push(insertClaim(claimId9, eligibilityId, reference, oneMonthAgo, claimStatusEnum.REJECTED.value, false))
          promises.push(insertClaim(claimId10, eligibilityId, reference, threeMonthsAgo, claimStatusEnum.PENDING.value, false))

          return Promise.all(promises)
        })
    })

    it('should return the correct number of In Progress claims submitted today', function () {
      const expectedResult = todayCount + 1
      return checkCount(dashboardFilterEnum.TODAY, expectedResult)
    })

    it('should return the correct number of In Progress claims submitted yesterday', function () {
      const expectedResult = yesterdayCount + 1
      return checkCount(dashboardFilterEnum.YESTERDAY, expectedResult)
    })

    it('should return the correct number of In Progress claims submitted in the last 7 days', function () {
      const expectedResult = last7DaysCount + 3
      return checkCount(dashboardFilterEnum.LAST_7_DAYS, expectedResult)
    })

    it('should return the correct number of In Progress claims submitted in the previous calendar month', function () {
      // Need to amend expected count if test is run before the 7th of the month,
      // because yesterday and last week could potentially be in the previous calendar month
      let expectedResult = oneMonthAgoCount + 1

      if (moment(yesterday).isSame(oneMonthAgo, 'month')) {
        expectedResult++
      }

      if (moment(lastWeek).isSame(oneMonthAgo, 'month')) {
        expectedResult++
      }

      return checkCount(dashboardFilterEnum.ONE_MONTH_AGO, expectedResult)
    })

    it('should return the correct number of In Progress claims submitted in the calendar month before the previous month', function () {
      const expectedResult = twoMonthsAgoCount + 1
      return checkCount(dashboardFilterEnum.TWO_MONTHS_AGO, expectedResult)
    })

    it('should return the correct number of In Progress claims submitted in the calendar month 3 months ago', function () {
      const expectedResult = threeMonthsAgoCount + 1
      return checkCount(dashboardFilterEnum.THREE_MONTHS_AGO, expectedResult)
    })

    it('should return the correct number of In Progress claims submitted in the calendar month 4 months ago', function () {
      const expectedResult = fourMonthsAgoCount + 1
      return checkCount(dashboardFilterEnum.FOUR_MONTHS_AGO, expectedResult)
    })

    after(function () {
      return deleteAll(reference)
    })
  })
})

function checkCount (filter, expectedCount) {
  return getInProgressClaimCount(filter)
    .then(function (result) {
      expect(result[0].Count).to.equal(expectedCount)
    })
    .catch(function (error) {
      throw error
    })
}

function getCountsBeforeTest () {
  const promises = []

  promises.push(getInProgressClaimCount(dashboardFilterEnum.TODAY).then(function (result) { todayCount = result[0].Count }))
  promises.push(getInProgressClaimCount(dashboardFilterEnum.YESTERDAY).then(function (result) { yesterdayCount = result[0].Count }))
  promises.push(getInProgressClaimCount(dashboardFilterEnum.LAST_7_DAYS).then(function (result) { last7DaysCount = result[0].Count }))
  promises.push(getInProgressClaimCount(dashboardFilterEnum.ONE_MONTH_AGO).then(function (result) { oneMonthAgoCount = result[0].Count }))
  promises.push(getInProgressClaimCount(dashboardFilterEnum.TWO_MONTHS_AGO).then(function (result) { twoMonthsAgoCount = result[0].Count }))
  promises.push(getInProgressClaimCount(dashboardFilterEnum.THREE_MONTHS_AGO).then(function (result) { threeMonthsAgoCount = result[0].Count }))
  promises.push(getInProgressClaimCount(dashboardFilterEnum.FOUR_MONTHS_AGO).then(function (result) { fourMonthsAgoCount = result[0].Count }))

  return Promise.all(promises)
}
