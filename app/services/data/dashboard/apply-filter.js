const dateFormatter = require('../../../../app/services/date-formatter')
const dashboardFilterEnum = require('../../../../app/constants/dashboard-filter-enum')

module.exports = function (query, filter) {
  switch (filter) {
    case dashboardFilterEnum.TODAY:
      return applyTodayFilter(query, filter)
    case dashboardFilterEnum.YESTERDAY:
      return applyYesterdayFilter(query, filter)
    case dashboardFilterEnum.LAST_WEEK:
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
      return query
  }
}

function applyTodayFilter (query, filter) {
  var startOfToday = dateFormatter.now().startOf('day')

  return query.where('DateSubmitted', '>=', startOfToday.toDate())
}

function applyYesterdayFilter (query, filter) {
  var startOfYesterday = dateFormatter.now().subtract(1, 'days').startOf('day')
  var endOfYesterday = dateFormatter.now().subtract(1, 'days').endOf('day')

  return query.where('DateSubmitted', '>=', startOfYesterday.toDate())
    .andWhere('DateSubmitted', '<=', endOfYesterday.toDate())
}

function applyLastWeekFilter (query, filter) {
  var startOf7DaysAgo = dateFormatter.now().subtract(7, 'days').startOf('day')

  return query.where('DateSubmitted', '>=', startOf7DaysAgo.toDate())
}

function applyOneMonthAgoFilter (query, filter) {
  var startOfPreviousMonth = dateFormatter.now().subtract(1, 'months').startOf('month')
  var endOfPreviousMonth = dateFormatter.now().subtract(1, 'months').endOf('month')

  return query.where('DateSubmitted', '>=', startOfPreviousMonth.toDate())
    .andWhere('DateSubmitted', '<=', endOfPreviousMonth.toDate())
}

function applyTwoMonthsAgoFilter (query, filter) {
  var startOfTwoMonthsAgo = dateFormatter.now().subtract(2, 'months').startOf('month')
  var endOfTwoMonthsAgo = dateFormatter.now().subtract(2, 'months').endOf('month')

  return query.where('DateSubmitted', '>=', startOfTwoMonthsAgo.toDate())
    .andWhere('DateSubmitted', '<=', endOfTwoMonthsAgo.toDate())
}

function applyThreeMonthsAgoFilter (query, filter) {
  var startOfThreeMonthsAgo = dateFormatter.now().subtract(3, 'months').startOf('month')
  var endOfThreeMonthsAgo = dateFormatter.now().subtract(3, 'months').endOf('month')

  return query.where('DateSubmitted', '>=', startOfThreeMonthsAgo.toDate())
    .andWhere('DateSubmitted', '<=', endOfThreeMonthsAgo.toDate())
}

function applyFourMonthsAgoFilter (query, filter) {
  var startOfFourMonthsAgo = dateFormatter.now().subtract(4, 'months').startOf('month')
  var endOfFourMonthsAgo = dateFormatter.now().subtract(4, 'months').endOf('month')

  return query.where('DateSubmitted', '>=', startOfFourMonthsAgo.toDate())
    .andWhere('DateSubmitted', '<=', endOfFourMonthsAgo.toDate())
}
