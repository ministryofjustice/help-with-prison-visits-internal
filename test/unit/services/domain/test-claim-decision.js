const ClaimDecision = require('../../../../app/services/domain/claim-decision')
const ValidationError = require('../../../../app/services/errors/validation-error')
const expect = require('chai').expect
var claimDecision

describe('services/domain/claim-decision', function () {
  const VALID_DECISION = 'REJECTED'
  const VALID_REASON = 'Relationship is incorrect'
  const NOTE = 'This is a test'
  const VALID_NOMIS_CHECK = 'APPROVED'
  const VALID_CLAIMEXPENSES = [{claimExpenseId: 1, approvedCost: '20', status: 'APPROVED'}]

  it('should construct a domain object given valid input', function (done) {
    claimDecision = new ClaimDecision(VALID_DECISION, '', VALID_REASON, '', '', NOTE, VALID_NOMIS_CHECK, VALID_CLAIMEXPENSES)
    expect(claimDecision.decision).to.equal(VALID_DECISION)
    expect(claimDecision.reason).to.equal(VALID_REASON)
    expect(claimDecision.note).to.equal(NOTE)
    expect(claimDecision.nomisCheck).to.equal(VALID_NOMIS_CHECK)
    done()
  })

  it('should return isRequired error for decision given empty strings', function (done) {
    try {
      claimDecision = new ClaimDecision('', '', '', '', '', '', VALID_NOMIS_CHECK, VALID_CLAIMEXPENSES)
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['decision'][0]).to.equal('Decision is required')
    }
    done()
  })

  it('should return isRequired error for reason given on reject', function (done) {
    try {
      claimDecision = new ClaimDecision(VALID_DECISION, '', '', '', '', '', '', [])
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['reason'][0]).to.equal('Reason is required')
    }
    done()
  })

  it('should return isRequired error for nomis-check given empty strings', function (done) {
    try {
      claimDecision = new ClaimDecision('', '', '', '', '', '', '', VALID_CLAIMEXPENSES)
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['nomis-check'][0]).to.equal('NOMIS check is required')
    }
    done()
  })

  it('should return error for invalid claim expenses', function (done) {
    // TODO
    done()
  })
})
