const getAuditConfig = require('../../../../../app/services/data/audit/get-audit-config')
const {
  insertAuditConfig,
  deleteAll
} = require('../../../../helpers/database-setup-for-tests')

describe('services/data/audit/get-audit-config', () => {
  describe('module', () => {
    it('should return the default values when there is no data in AuditConfig', () => {
      const expectedResult = { ThresholdAmount: '250', VerificationPercent: '20' }
      return getAuditConfig()
        .then(result => {
          expect(JSON.stringify(result)).toBe(JSON.stringify(expectedResult))
        })
    })

    it('should return the last inserted values from AuditConfig', () => {
      const promises = []
      promises.push(insertAuditConfig('100', '10'))
      promises.push(insertAuditConfig('200', '15'))
      Promise.all(promises)
      const expectedResult = { ThresholdAmount: '200', VerificationPercent: '15' }
      return getAuditConfig()
        .then(result => {
          expect(JSON.stringify(result)).toBe(JSON.stringify(expectedResult))
        })
    })

    afterAll(() => {
      return deleteAll('')
    })
  })
})
