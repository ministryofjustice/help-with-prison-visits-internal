const expect = require('chai').expect
const dateFormatter = require('../../../../app/services/date-formatter')
const { insertTestData, deleteAll } = require('../../../helpers/database-setup-for-tests')

const getClaimLastUpdated = require('../../../../app/services/data/get-claim-last-updated')
const reference = 'V123456'
let date
let claimId

describe('services/data/get-claim-last-updated', function () {
  describe('module', function () {
    before(function () {
      date = dateFormatter.now()
      return insertTestData(reference, date.toDate(), 'TESTING').then(function (ids) {
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
      return deleteAll(reference)
    })
  })
})
