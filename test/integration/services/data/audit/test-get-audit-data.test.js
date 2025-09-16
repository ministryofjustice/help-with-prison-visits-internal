const dateFormatter = require('../../../../../app/services/date-formatter')
const {
  insertAuditReport,
  deleteAll
} = require('../../../../helpers/database-setup-for-tests')
const getAuditData = require('../../../../../app/services/data/audit/get-audit-data')

const reference = 'TEST'
const yesterday = dateFormatter.now().subtract(1, 'days').toDate()

describe('services/data/audit/get-audit-data', () => {
  describe('module', () => {
    beforeAll(() => {
      const promises = []

      promises.push(insertAuditReport(true, yesterday, yesterday))
      promises.push(insertAuditReport(true, yesterday, yesterday))
      promises.push(insertAuditReport(true, yesterday, yesterday))
      promises.push(insertAuditReport(false, yesterday, yesterday))

      return Promise.all(promises)
    })

    it('should return all the report data which are not marked as deleted', () => {
      const expectedResult = [{ ReportId: 72, StartDate: '2024-03-02T21:11:55.436Z', EndDate: '2024-03-02T21:11:55.436Z', CheckStatus: null, VerificationStatus: null, FinalStatus: null, IsDeleted: false }]
      getAuditData().then(result => {
        expect(result).toBe(expectedResult)
      })
    })

    afterAll(() => {
      deleteAll('ABC123')
      return deleteAll(reference)
    })
  })
})
