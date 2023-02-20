const expect = require('chai').expect
const dateFormatter = require('../../../../app/services/date-formatter')
const { insertTestData, deleteAll } = require('../../../helpers/database-setup-for-tests')

const getClaimEscorts = require('../../../../app/services/data/get-claim-escorts')
const reference = 'GETESCORT'
let claimId
let claimEscortId

describe('services/data/get-claim-escort', function () {
  before(function () {
    return insertTestData(reference, dateFormatter.now().toDate(), 'TESTING')
      .then(function (ids) {
        claimId = [ids.claimId]
        claimEscortId = ids.claimEscortId
      })
  })

  it('should return the expected claim escort', function () {
    return getClaimEscorts(claimId)
      .then(function (result) {
        expect(result[0].ClaimEscortId).to.equal(claimEscortId)
      })
      .catch(function (error) {
        throw error
      })
  })

  after(function () {
    return deleteAll(reference)
  })
})
