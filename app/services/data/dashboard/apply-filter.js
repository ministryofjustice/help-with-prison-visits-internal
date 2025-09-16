const dateFormatter = require('../../date-formatter')
const dashboardFilterEnum = require('../../../constants/dashboard-filter-enum')

module.exports = (query, filter) => {
  switch (filter) {
    case dashboardFilterEnum.TODAY:
      return applyTodayFilter(query, filter)
    case dashboardFilterEnum.YESTERDAY:
      return applyYesterdayFilter(query, filter)
    case dashboardFilterEnum.LAST_7_DAYS:
      return applyLastWeekFilter(query, filter)
    case dashboardFilterEnum.ONE_MONTH_AGO:
      return applyOneMonthAgoFilter(query, filter)
    case dashboardFilterEnum.TWO_MONTHS_AGO:
      return applyTwoMonthsAgoFilter(query, filter)
    case dashboardFilterEnum.THREE_MONTHS_AGO:
      return applyThreeMonthsAgoFilter(query, filter)
    case dashboardFilterEnum.FOUR_MONTHS_AGO:
      return applyFourMonthsAgoFilter(query, filter)
    default:
      throw new Error('No filter specified for dashboard')
  }
}

function applyTodayFilter(query) {
  const startOfToday = dateFormatter.now().startOf('day')

  return query.where('DateSubmitted', '>=', startOfToday.toDate())
}

function applyYesterdayFilter(query) {
  const startOfYesterday = dateFormatter.now().subtract(1, 'days').startOf('day')
  const endOfYesterday = dateFormatter.now().subtract(1, 'days').endOf('day')

  return query
    .where('DateSubmitted', '>=', startOfYesterday.toDate())
    .andWhere('DateSubmitted', '<=', endOfYesterday.toDate())
}

function applyLastWeekFilter(query) {
  const startOf7DaysAgo = dateFormatter.now().subtract(7, 'days').startOf('day')

  return query.where('DateSubmitted', '>=', startOf7DaysAgo.toDate())
}

function applyOneMonthAgoFilter(query) {
  const startOfPreviousMonth = dateFormatter.now().subtract(1, 'months').startOf('month')
  const endOfPreviousMonth = dateFormatter.now().subtract(1, 'months').endOf('month')

  return query
    .where('DateSubmitted', '>=', startOfPreviousMonth.toDate())
    .andWhere('DateSubmitted', '<=', endOfPreviousMonth.toDate())
}

function applyTwoMonthsAgoFilter(query) {
  const startOfTwoMonthsAgo = dateFormatter.now().subtract(2, 'months').startOf('month')
  const endOfTwoMonthsAgo = dateFormatter.now().subtract(2, 'months').endOf('month')

  return query
    .where('DateSubmitted', '>=', startOfTwoMonthsAgo.toDate())
    .andWhere('DateSubmitted', '<=', endOfTwoMonthsAgo.toDate())
}

function applyThreeMonthsAgoFilter(query) {
  const startOfThreeMonthsAgo = dateFormatter.now().subtract(3, 'months').startOf('month')
  const endOfThreeMonthsAgo = dateFormatter.now().subtract(3, 'months').endOf('month')

  return query
    .where('DateSubmitted', '>=', startOfThreeMonthsAgo.toDate())
    .andWhere('DateSubmitted', '<=', endOfThreeMonthsAgo.toDate())
}

function applyFourMonthsAgoFilter(query) {
  const startOfFourMonthsAgo = dateFormatter.now().subtract(4, 'months').startOf('month')
  const endOfFourMonthsAgo = dateFormatter.now().subtract(4, 'months').endOf('month')

  return query
    .where('DateSubmitted', '>=', startOfFourMonthsAgo.toDate())
    .andWhere('DateSubmitted', '<=', endOfFourMonthsAgo.toDate())
}
