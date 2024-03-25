const dateFormatter = require('../../../../app/services/date-formatter')
const { getTestData, insertTestData, deleteAll } = require('../../../helpers/database-setup-for-tests')

const getClaimChildCounts = require('../../../../app/services/data/get-claim-child-counts')
const reference = 'CHILDCOUNT'
let claimId
let expectedValue

describe('services/data/get-claim-child-count', function () {
  beforeAll(function () {
    const testData = getTestData(reference, '')
    expectedValue = testData.ClaimChild.length

    return insertTestData(reference, dateFormatter.now().toDate(), 'TESTING')
      .then(function (ids) {
        claimId = [ids.claimId]
      })
  })

  it('should return the expected count of claim children', function () {
    return getClaimChildCounts(claimId)
      .then(function (result) {
        expect(result[0].Count).toBe(expectedValue)
      })
      .catch(function (error) {
        throw error
      })
  })

  afterAll(function () {
    return deleteAll(reference)
  })
})
