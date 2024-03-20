const getReportDates = require('../../../../../app/services/data/audit/get-report-dates')
const dateFormatter = require('../../../../../app/services/date-formatter')
const {
  insertAuditReport,
  deleteAll
} = require('../../../../helpers/database-setup-for-tests')

const reference = 'TEST'
const yesterday = dateFormatter.now().subtract(1, 'days').toDate()

describe('services/data/audit/get-report-dates', function () {
  describe('module', function () {
    it('should return the dates for given reportId if it exist in ReportData', function () {
      insertAuditReport(false, yesterday, yesterday).then(function (result) {
        const reportId = result[0].ReportId
        const expectedResult = [{ StartDate: yesterday, EndDate: yesterday }]
        return getReportDates(reportId)
          .then(function (reportDates) {
            expect(JSON.stringify(reportDates)).toBe(JSON.stringify(expectedResult))
          });
      })
    })

    afterAll(function () {
      return deleteAll(reference)
    })
  })
})
