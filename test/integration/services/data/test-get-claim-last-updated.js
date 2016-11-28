var expect = require('chai').expect
var moment = require('moment')
var databaseHelper = require('../../../helpers/database-setup-for-tests')

var getClaimLastUpdated = require('../../../../app/services/data/get-claim-last-updated')
var testData
var reference = 'V123456'
var date
var claimId

describe('services/data/get-claim-last-updated', function () {
  describe('module', function () {
    before(function () {
      date = moment()
      testData = databaseHelper.getTestData(reference, 'TESTING')
      return databaseHelper.insertTestData(reference, date.toDate(), 'TESTING').then(function (ids) {
        claimId = ids.claimId
      })
    })

    it('should return list of claims and total', function () {
      return getClaimLastUpdated(claimId)
        .then(function (result) {
          expect(result.Status).to.equal('TESTING')
        })
        .catch(function (error) {
          throw error
        })
    })

    after(function () {
      return databaseHelper.deleteAll(reference)
    })
  })
})
