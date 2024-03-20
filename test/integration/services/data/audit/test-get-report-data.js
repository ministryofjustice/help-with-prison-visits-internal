const getReportData = require('../../../../../app/services/data/audit/get-report-data')
const dateFormatter = require('../../../../../app/services/date-formatter')
const {
  insertReportData,
  insertAuditReport,
  deleteAll
} = require('../../../../helpers/database-setup-for-tests')

const reference = 'TEST'
const yesterday = dateFormatter.now().subtract(1, 'days').toDate()

describe('services/data/audit/get-report-data', function () {
  describe('module', function () {
    it('should return null when there is no data in ReportData', function () {
      const expectedResult = null
      return getReportData(1)
        .then(function (result) {
          expect(result).toBe(expectedResult)
        });
    })

    it('should return the data for given reportId if it exist in ReportData', function () {
      insertAuditReport(false, yesterday, yesterday).then(function (result) {
        const reportId = result[0].ReportId
        insertReportData(reportId, 1231, reference, 50).then(function () {
          const expectedResult = [{ ReportId: reportId, Reference: 'TEST', ClaimId: 1231, PaymentAmount: 50, Band5Username: null, Band5Validity: null, Band5Description: null, Band9Username: null, Band9Validity: null, Band9Description: null }]
          return getReportData(reportId)
            .then(function (reportData) {
              expect(JSON.stringify(reportData)).toBe(JSON.stringify(expectedResult))
            });
        })
      })
    })

    afterAll(function () {
      return deleteAll(reference)
    })
  })
})
