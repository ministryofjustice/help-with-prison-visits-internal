const ClaimDecision = require('../../../../app/services/domain/claim-decision')
const ValidationError = require('../../../../app/services/errors/validation-error')
const expect = require('chai').expect
var claimDecision

describe('services/domain/claim-decision', function () {
  const VALID_CASEWORKER = 'adam@adams.gov'
  const VALID_ASSISTED_DIGITAL_CASEWORKER = 'betty@barnes.gov'
  const VALID_DECISION = 'REJECTED'
  const VALID_REASON = 'Relationship is incorrect'
  const NOTE = 'This is a test'
  const VALID_CLAIMEXPENSES = [{claimExpenseId: '1', approvedCost: '20.00', cost: '20.00', status: 'APPROVED'}]
  const INVALID_CLAIMEXPENSES = [{claimExpenseId: '1', approvedCost: '20.00', cost: '-1', status: 'APPROVED'}]
  const VALID_NOMIS_CHECK = 'APPROVED'
  const VALID_DWP_CHECK = 'APPROVED'
  const VALID_VISIT_CONFIRMATION_CHECK = 'APPROVED'

  it('should construct a domain object given valid input', function () {
    claimDecision = new ClaimDecision(VALID_CASEWORKER, VALID_ASSISTED_DIGITAL_CASEWORKER, VALID_DECISION, '', VALID_REASON, '', '', NOTE, VALID_NOMIS_CHECK, VALID_DWP_CHECK, VALID_VISIT_CONFIRMATION_CHECK, VALID_CLAIMEXPENSES)
    expect(claimDecision.decision).to.equal(VALID_DECISION)
    expect(claimDecision.reason).to.equal(VALID_REASON)
    expect(claimDecision.note).to.equal(NOTE)
    expect(claimDecision.nomisCheck).to.equal(VALID_NOMIS_CHECK)
    expect(claimDecision.dwpCheck).to.equal(VALID_DWP_CHECK)
    expect(claimDecision.visitConfirmationCheck).to.equal(VALID_VISIT_CONFIRMATION_CHECK)
  })

  it('should return isRequired error for decision given empty strings', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, '', '', '', '', '', '', '', VALID_NOMIS_CHECK, VALID_DWP_CHECK, VALID_VISIT_CONFIRMATION_CHECK, VALID_CLAIMEXPENSES)
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['decision'][0]).to.equal('Decision is required')
    }
  })

  it('should return isRequired error for reason given on reject', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, '', VALID_DECISION, '', '', '', '', '', VALID_NOMIS_CHECK, '', VALID_VISIT_CONFIRMATION_CHECK, VALID_CLAIMEXPENSES)
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['reason'][0]).to.equal('Reason is required')
    }
  })

  it('should return isRequired error for nomis-check given empty strings', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, '', '', '', '', '', '', '', '', '', VALID_VISIT_CONFIRMATION_CHECK, VALID_CLAIMEXPENSES)
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['nomis-check'][0]).to.equal('NOMIS check is required')
    }
  })

  it('should return isRequired error for dwp-check given empty strings', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, '', '', '', '', '', '', '', '', '', VALID_VISIT_CONFIRMATION_CHECK, VALID_CLAIMEXPENSES)
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['dwp-check'][0]).to.equal('DWP check is required')
    }
  })

  it('should return isRequired error for visit-confirmation-check given empty strings', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, '', '', '', '', '', '', '', '', '', '', VALID_CLAIMEXPENSES)
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['visit-confirmation-check'][0]).to.equal('Visit confirmation check is required')
    }
  })

  it('should return error for invalid claim expenses', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, '', '', '', '', '', '', '', '', '', VALID_VISIT_CONFIRMATION_CHECK, INVALID_CLAIMEXPENSES)
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['approve-cost'][0]).to.equal('New approved cost must be greater than zero')
    }
  })

  it('should return error if same caseworker as assisted digital caseworker', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, VALID_CASEWORKER, '', '', '', '', '', '', '', '', VALID_VISIT_CONFIRMATION_CHECK, INVALID_CLAIMEXPENSES)
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['assisted-digital-caseworker'][0]).to.equal('You cannot process this claim since you filled in on behalf of a visitor')
    }
  })
})
