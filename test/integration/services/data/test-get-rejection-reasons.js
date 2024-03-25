const getRejectionReasons = require('../../../../app/services/data/get-rejection-reasons')

describe('services/data/get-rejection-reasons', function () {
  it('should retrieve all rejection reasons from the database', function (done) {
    getRejectionReasons().then(function (reasons) {
      expect(reasons[0].reason).toBe(
        'Information needed not received within 6 weeks of the claim being submitted/request being sent. Do not have proof of visit/tickets'
      )
      expect(reasons[11].reason).toBe('Claim was submitted over 28 days after the visit')
      done()
    })
  })
})
