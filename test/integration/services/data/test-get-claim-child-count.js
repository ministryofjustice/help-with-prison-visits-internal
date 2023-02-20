const expect = require('chai').expect
const dateFormatter = require('../../../../app/services/date-formatter')
const { getTestData, insertTestData, deleteAll } = require('../../../helpers/database-setup-for-tests')

const getClaimChildCount = require('../../../../app/services/data/get-claim-child-count')
const reference = 'CHILDCOUNT'
let claimId
let expectedValue

describe('services/data/get-claim-child-count', function () {
  before(function () {
    const testData = getTestData(reference, '')
    expectedValue = testData.ClaimChild.length

    return insertTestData(reference, dateFormatter.now().toDate(), 'TESTING')
      .then(function (ids) {
        claimId = ids.claimId
      })
  })

  it('should return the expected count of claim children', function () {
    return getClaimChildCount(claimId)
      .then(function (result) {
        expect(result[0].Count).to.equal(expectedValue)
      })
      .catch(function (error) {
        throw error
      })
  })

  after(function () {
    return deleteAll(reference)
  })
})
