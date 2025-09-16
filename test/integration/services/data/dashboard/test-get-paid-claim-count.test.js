const moment = require('moment')
const dateFormatter = require('../../../../../app/services/date-formatter')
const { insertTestData, insertClaim, deleteAll } = require('../../../../helpers/database-setup-for-tests')

const getPaidClaimCount = require('../../../../../app/services/data/dashboard/get-paid-claim-count')
const claimStatusEnum = require('../../../../../app/constants/claim-status-enum')
const dashboardFilterEnum = require('../../../../../app/constants/dashboard-filter-enum')

const reference = 'PAID'
const paymentStatusProcessed = 'PROCESSED'
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

describe('services/data/dashboard/get-paid-claim-count', () => {
  describe('module', () => {
    beforeAll(() => {
      return getCountsBeforeTest()
        .then(() => {
          return insertTestData(reference, date, claimStatusEnum.AUTOAPPROVED.value)
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

          promises.push(insertClaim(claimId2, eligibilityId, reference, date, claimStatusEnum.APPROVED.value, false, null, null, true, paymentStatusProcessed))
          promises.push(insertClaim(claimId3, eligibilityId, reference, yesterday, claimStatusEnum.APPROVED_ADVANCE_CLOSED.value, false, null, null, true, null))
          promises.push(insertClaim(claimId4, eligibilityId, reference, lastWeek, claimStatusEnum.AUTOAPPROVED.value, false, null, null, false, paymentStatusProcessed))
          promises.push(insertClaim(claimId5, eligibilityId, reference, oneMonthAgo, claimStatusEnum.APPROVED.value, false, null, null, false, paymentStatusProcessed))
          promises.push(insertClaim(claimId6, eligibilityId, reference, twoMonthsAgo, claimStatusEnum.APPROVED_ADVANCE_CLOSED.value, false, null, null, true, null))
          promises.push(insertClaim(claimId7, eligibilityId, reference, threeMonthsAgo, claimStatusEnum.AUTOAPPROVED.value, false, null, null, false, paymentStatusProcessed))
          promises.push(insertClaim(claimId8, eligibilityId, reference, fourMonthsAgo, claimStatusEnum.APPROVED.value, false, null, null, false, paymentStatusProcessed))
          promises.push(insertClaim(claimId9, eligibilityId, reference, yesterday, claimStatusEnum.APPROVED_ADVANCE_CLOSED.value, false, null, null, false, null))
          promises.push(insertClaim(claimId10, eligibilityId, reference, threeMonthsAgo, claimStatusEnum.PENDING.value, false, null, null, false, null))

          return Promise.all(promises)
        })
    })

    it('should return the correct number of Paid claims submitted today', () => {
      const expectedResult = todayCount + 1
      return checkCount(dashboardFilterEnum.TODAY, expectedResult)
    })

    it('should return the correct number of Paid claims submitted yesterday', () => {
      const expectedResult = yesterdayCount + 1
      return checkCount(dashboardFilterEnum.YESTERDAY, expectedResult)
    })

    it('should return the correct number of Paid claims submitted in the last 7 days', () => {
      const expectedResult = last7DaysCount + 3
      return checkCount(dashboardFilterEnum.LAST_7_DAYS, expectedResult)
    })

    it('should return the correct number of Paid claims submitted in the previous calendar month', () => {
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

    it('should return the correct number of Paid claims submitted in the calendar month before the previous month', () => {
      const expectedResult = twoMonthsAgoCount + 1
      return checkCount(dashboardFilterEnum.TWO_MONTHS_AGO, expectedResult)
    })

    it('should return the correct number of Paid claims submitted in the calendar month 3 months ago', () => {
      const expectedResult = threeMonthsAgoCount + 1
      return checkCount(dashboardFilterEnum.THREE_MONTHS_AGO, expectedResult)
    })

    it('should return the correct number of Paid claims submitted in the calendar month 4 months ago', () => {
      const expectedResult = fourMonthsAgoCount + 1
      return checkCount(dashboardFilterEnum.FOUR_MONTHS_AGO, expectedResult)
    })

    afterAll(() => {
      return deleteAll(reference)
    })
  })
})

function checkCount (filter, expectedCount) {
  return getPaidClaimCount(filter)
    .then(result => {
      expect(result[0].Count).toBe(expectedCount)
    })
    .catch(error => {
      throw error
    })
}

function getCountsBeforeTest () {
  const promises = []

  promises.push(getPaidClaimCount(dashboardFilterEnum.TODAY).then(result => { todayCount = result[0].Count }))
  promises.push(getPaidClaimCount(dashboardFilterEnum.YESTERDAY).then(result => { yesterdayCount = result[0].Count }))
  promises.push(getPaidClaimCount(dashboardFilterEnum.LAST_7_DAYS).then(result => { last7DaysCount = result[0].Count }))
  promises.push(getPaidClaimCount(dashboardFilterEnum.ONE_MONTH_AGO).then(result => { oneMonthAgoCount = result[0].Count }))
  promises.push(getPaidClaimCount(dashboardFilterEnum.TWO_MONTHS_AGO).then(result => { twoMonthsAgoCount = result[0].Count }))
  promises.push(getPaidClaimCount(dashboardFilterEnum.THREE_MONTHS_AGO).then(result => { threeMonthsAgoCount = result[0].Count }))
  promises.push(getPaidClaimCount(dashboardFilterEnum.FOUR_MONTHS_AGO).then(result => { fourMonthsAgoCount = result[0].Count }))

  return Promise.all(promises)
}
