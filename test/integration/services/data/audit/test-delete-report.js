const expect = require('chai').expect
const dateFormatter = require('../../../../../app/services/date-formatter')
const {
  insertClaim,
  insertAuditReport,
  insertReportData,
  deleteAll,
  db
} = require('../../../../helpers/database-setup-for-tests')
const claimStatusEnum = require('../../../../../app/constants/claim-status-enum')
const deleteReport = require('../../../../../app/services/data/audit/delete-report')

const reference = 'TEST'
const yesterday = dateFormatter.now().subtract(1, 'days').toDate()

describe('services/data/audit/delete-report', function () {
  describe('module', function () {
    before(function () {
      const promises = []
      promises.push(insertClaim(1231, 12311, reference, yesterday, claimStatusEnum.APPROVED.value, false, null, null, null, null, true))
      promises.push(insertClaim(1232, 12322, reference, yesterday, claimStatusEnum.APPROVED.value, false, null, null, null, null, true))
      promises.push(insertClaim(1233, 12333, reference, yesterday, claimStatusEnum.APPROVED.value, false, null, null, null, null, true))
      promises.push(insertClaim(1234, 12344, reference, yesterday, claimStatusEnum.APPROVED.value, false, null, null, null, null, true))
      promises.push(insertClaim(1235, 12345, 'ABC123', yesterday, claimStatusEnum.APPROVED.value, false, null, null, null, null, true))

      promises.push(insertAuditReport(false, yesterday, yesterday))
      promises.push(insertAuditReport(true, yesterday, yesterday))
      promises.push(insertAuditReport(false, yesterday, yesterday))
      promises.push(insertAuditReport(false, yesterday, yesterday))

      promises.push(insertReportData(4, 1231, reference, 50))
      promises.push(insertReportData(4, 1232, reference, 80))
      promises.push(insertReportData(2, 1233, reference, 60))
      promises.push(insertReportData(1, 1234, reference, 20))
      promises.push(insertReportData(3, 1235, 'ABC123', 10))

      return Promise.all(promises)
    })

    it('should delete report and update flag and AuditReport and ReportData', function () {
      deleteReport(5).then(function () {
        return db('AuditReport')
          .select('IsDeleted')
          .where('ReportId', 5).then(function (isDeleted) {
            expect(isDeleted).to.be.false //eslint-disable-line
          })
      })
    })

    after(function () {
      deleteAll('ABC123')
      return deleteAll(reference)
    })
  })
})
