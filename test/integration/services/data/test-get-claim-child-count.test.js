const dateFormatter = require('../../../../app/services/date-formatter')
const { getTestData, insertTestData, deleteAll } = require('../../../helpers/database-setup-for-tests')

const getClaimChildCounts = require('../../../../app/services/data/get-claim-child-counts')
const reference = 'CHILDCOUNT'
let claimId
let expectedValue

describe('services/data/get-claim-child-count', () => {
  beforeAll(() => {
    const testData = getTestData(reference, '')
    expectedValue = testData.ClaimChild.length

    return insertTestData(reference, dateFormatter.now().toDate(), 'TESTING')
      .then(function (ids) {
        claimId = [ids.claimId]
      })
  })

  it('should return the expected count of claim children', () => {
    return getClaimChildCounts(claimId)
      .then(result => {
        expect(result[0].Count).toBe(expectedValue)
      })
      .catch(error => {
        throw error
      })
  })

  afterAll(() => {
    return deleteAll(reference)
  })
})
