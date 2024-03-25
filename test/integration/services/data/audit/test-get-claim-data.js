const getClaimData = require('../../../../../app/services/data/audit/get-claim-data')
const {
  insertReportData,
  deleteAll
} = require('../../../../helpers/database-setup-for-tests')

const reference = 'TEST'

describe('services/data/audit/get-claim-data', function () {
  describe('module', function () {
    beforeAll(function () {
      const promises = []
      promises.push(insertReportData(4, 1231, reference, 50))
      promises.push(insertReportData(5, 1232, reference, 80))
      promises.push(insertReportData(2, 1233, reference, 60))
      promises.push(insertReportData(1, 1234, reference, 20))
      promises.push(insertReportData(3, 1235, reference, 10))

      return Promise.all(promises)
    })

    it('should return the correct claim data based on given reportId and reference', function () {
      let expectResult = [{ ClaimId: 1231, Band5Validity: null, Band5Description: null, Band5Username: null, Band9Validity: null, Band9Description: null, Band9Username: null }]
      getData(reference, 4, expectResult)
      expectResult = [{ ClaimId: 1232, Band5Validity: null, Band5Description: null, Band5Username: null, Band9Validity: null, Band9Description: null, Band9Username: null }]
      getData(reference, 5, expectResult)
    })

    afterAll(function () {
      return deleteAll(reference)
    })
  })
})

function getData (reference, reportId, expectedResult) {
  return getClaimData(reference, reportId)
    .then(function (result) {
      expect(result[0]).toBe(expectedResult)
    })
    .catch(function (error) {
      throw error
    })
}
