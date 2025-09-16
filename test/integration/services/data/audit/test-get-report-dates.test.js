const getReportDates = require('../../../../../app/services/data/audit/get-report-dates')
const dateFormatter = require('../../../../../app/services/date-formatter')
const {
  insertAuditReport,
  deleteAll
} = require('../../../../helpers/database-setup-for-tests')

const reference = 'TEST'
const yesterday = dateFormatter.now().subtract(1, 'days').toDate()

describe('services/data/audit/get-report-dates', () => {
  describe('module', () => {
    it('should return the dates for given reportId if it exist in ReportData', () => {
      insertAuditReport(false, yesterday, yesterday).then(result => {
        const reportId = result[0].ReportId
        const expectedResult = [{ StartDate: yesterday, EndDate: yesterday }]
        return getReportDates(reportId)
          .then(function (reportDates) {
            expect(JSON.stringify(reportDates)).toBe(JSON.stringify(expectedResult))
          })
      })
    })

    afterAll(() => {
      return deleteAll(reference)
    })
  })
})
