const getRejectionReasonId = require('../../../../app/services/data/get-rejection-reason-id')
const getRejectionReasons = require('../../../../app/services/data/get-rejection-reasons')
let rejectionReasons

describe('services/data/get-rejection-reason-id', function () {
  beforeAll(function () {
    return getRejectionReasons()
      .then(function (reasons) {
        rejectionReasons = reasons
      })
  })

  it('should retrieve the rejection reason id for each given rejection reason', function (done) {
    rejectionReasons.forEach(function (reason) {
      getRejectionReasonId(reason.reason).then(function (id) {
        expect(id).toBe(reason.id)
      })
    })
    done()
  })
})
