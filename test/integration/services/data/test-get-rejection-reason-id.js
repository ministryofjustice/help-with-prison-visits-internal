const expect = require('chai').expect
const getRejectionReasonId = require('../../../../app/services/data/get-rejection-reason-id')
const getRejectionReasons = require('../../../../app/services/data/get-rejection-reasons')
var rejectionReasons

describe('services/data/get-rejection-reason-id', function () {

  before(function () {
    return getRejectionReasons()
      .then(function (reasons){
        rejectionReasons = reasons
      })
  })

  it('should retrieve the rejection reason id for each given rejection reason', function (done) {
    rejectionReasons.forEach(function (reason){
      getRejectionReasonId(reason).then(function (id) {
        expect(id).to.eq(reason.id)
        done()
      })
    })
  })
})
