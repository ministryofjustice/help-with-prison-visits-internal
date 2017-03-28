var expect = require('chai').expect
var dateFormatter = require('../../../../app/services/date-formatter')
var databaseHelper = require('../../../helpers/database-setup-for-tests')

var getClaimChildCount = require('../../../../app/services/data/get-claim-child-count')
var reference = 'CHILDCOUNT'
var claimId
var expectedValue

describe('services/data/get-claim-child-count', function () {
  before(function () {
    var testData = databaseHelper.getTestData(reference, '')
    expectedValue = testData.ClaimChild.length

    return databaseHelper.insertTestData(reference, dateFormatter.now().toDate(), 'TESTING')
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
    return databaseHelper.deleteAll(reference)
  })
})
