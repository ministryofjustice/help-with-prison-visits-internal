const ClaimDecision = require('../../../../app/services/domain/claim-decision')
const ValidationError = require('../../../../app/services/errors/validation-error')
const expect = require('chai').expect
var claimDecision

describe('services/domain/claim-decision', function () {
  const VALID_DECISION = 'reject'
  const VALID_REASON = 'Relationship is incorrect'
  const NOTE = 'This is a test'
  const VALID_CLAIM_STATUS = {decision: VALID_DECISION, reasonReject: VALID_REASON, additionalInfoReject: NOTE}
  const INVALID_CLAIM_STATUS = {decision: VALID_DECISION}

  it('should construct a domain object given valid input', function (done) {
    claimDecision = new ClaimDecision(VALID_CLAIM_STATUS)
    expect(claimDecision.decision).to.equal('REJECTED')
    expect(claimDecision.reason).to.equal(VALID_REASON)
    expect(claimDecision.note).to.equal(NOTE)
    done()
  })

  it('should return isRequired error for decision given empty strings', function (done) {
    try {
      claimDecision = new ClaimDecision({})
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['decision'][0]).to.equal('Decision is required')
    }
    done()
  })

  it('should return isRequired error for reason given reject', function (done) {
    try {
      claimDecision = new ClaimDecision(INVALID_CLAIM_STATUS)
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['reason'][0]).to.equal('Reason is required')
    }
    done()
  })
})
