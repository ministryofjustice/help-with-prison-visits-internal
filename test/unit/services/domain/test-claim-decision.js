const ClaimDecision = require('../../../../app/services/domain/claim-decision')
const ValidationError = require('../../../../app/services/errors/validation-error')
const expect = require('chai').expect
var claimDecision

describe('services/domain/claim-decision', function () {
  const VALID_CASEWORKER = 'adam@adams.gov'
  const VALID_ASSISTED_DIGITAL_CASEWORKER = 'betty@barnes.gov'
  const VALID_DECISION_REJECTED = 'REJECTED'
  const VALID_DECISION_REQUESTED = 'REQUEST_INFORMATION'
  const VALID_DECISION_APPROVED = 'APPROVED'
  const VALID_NOTE_REJECTION = 'rejection note'
  const VALID_CLAIMEXPENSES = [{claimExpenseId: '1', approvedCost: '20.00', cost: '20.00', status: 'APPROVED'}]
  const VALID_CLAIMEXPENSES_REJECTED = [{claimExpenseId: '1', approvedCost: '20.00', cost: '20.00', status: 'REJECTED'}]
  const INVALID_CLAIMEXPENSES = [{claimExpenseId: '1', approvedCost: '20.00', cost: '-1', status: 'APPROVED'}]
  const VALID_NOMIS_CHECK = 'APPROVED'
  const VALID_DWP_CHECK = 'APPROVED'
  const VALID_VISIT_CONFIRMATION_CHECK = 'APPROVED'

  it('should construct a domain object given valid input', function () {
    claimDecision = new ClaimDecision(VALID_CASEWORKER, VALID_ASSISTED_DIGITAL_CASEWORKER, VALID_DECISION_REJECTED, '', '', VALID_NOTE_REJECTION, VALID_NOMIS_CHECK, VALID_DWP_CHECK, VALID_VISIT_CONFIRMATION_CHECK, VALID_CLAIMEXPENSES)
    expect(claimDecision.decision).to.equal(VALID_DECISION_REJECTED)
    expect(claimDecision.nomisCheck).to.equal(VALID_NOMIS_CHECK)
    expect(claimDecision.dwpCheck).to.equal(VALID_DWP_CHECK)
    expect(claimDecision.visitConfirmationCheck).to.equal(VALID_VISIT_CONFIRMATION_CHECK)
  })

  it('should return isRequired error for decision given empty strings', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, VALID_ASSISTED_DIGITAL_CASEWORKER, '', '', '', VALID_NOTE_REJECTION, VALID_NOMIS_CHECK, VALID_DWP_CHECK, VALID_VISIT_CONFIRMATION_CHECK, VALID_CLAIMEXPENSES)
      expect(false, 'should have thrown validation error').to.be.true
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['decision'][0]).to.equal('Decision is required')
    }
  })

  it('should return isRequired error for note given on reject', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, '', VALID_DECISION_REJECTED, '', '', '', VALID_NOMIS_CHECK, '', VALID_VISIT_CONFIRMATION_CHECK, VALID_CLAIMEXPENSES)
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['additional-info-reject'][0]).to.equal('Additional information is required')
    }
  })

  it('should return isRequired error for note given on request information', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, '', VALID_DECISION_REQUESTED, '', '', '', VALID_NOMIS_CHECK, '', VALID_VISIT_CONFIRMATION_CHECK, VALID_CLAIMEXPENSES)
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['additional-info-request'][0]).to.equal('Additional information is required')
    }
  })

  it('should return isRequired error for nomis-check given empty strings', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, '', '', '', '', '', '', '', VALID_VISIT_CONFIRMATION_CHECK, VALID_CLAIMEXPENSES)
      expect(false, 'should have thrown validation error').to.be.true
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['nomis-check'][0]).to.equal('NOMIS check is required')
    }
  })

  it('should return isRequired error for dwp-check given empty strings', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, '', '', '', '', '', '', '', VALID_VISIT_CONFIRMATION_CHECK, VALID_CLAIMEXPENSES)
      expect(false, 'should have thrown validation error').to.be.true
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['dwp-check'][0]).to.equal('Benefit check is required')
    }
  })

  it('should return isRequired error for visit-confirmation-check given empty strings', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, '', '', '', '', '', '', '', '', VALID_CLAIMEXPENSES)
      expect(false, 'should have thrown validation error').to.be.true
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['visit-confirmation-check'][0]).to.equal('Visit confirmation check is required')
    }
  })

  it('should return error for invalid claim expenses', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, '', '', '', '', '', '', '', VALID_VISIT_CONFIRMATION_CHECK, INVALID_CLAIMEXPENSES)
      expect(false, 'should have thrown validation error').to.be.true
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['approve-cost'][0]).to.equal('New approved cost must be greater than zero')
    }
  })

  it('should return error if approving with all expenses rejected', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, '', VALID_DECISION_APPROVED, '', '', '', '', '', VALID_VISIT_CONFIRMATION_CHECK, VALID_CLAIMEXPENSES_REJECTED)
      expect(false, 'should have thrown validation error').to.be.true
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['claim-expenses'][0]).to.equal('At least one expense must not be rejected for the claim to be approved')
    }
  })

  it('should return error if same caseworker as assisted digital caseworker', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, VALID_CASEWORKER, '', '', '', '', '', '', VALID_VISIT_CONFIRMATION_CHECK, VALID_CLAIMEXPENSES_REJECTED)
      expect(false, 'should have thrown validation error').to.be.true
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['assisted-digital-caseworker'][0]).to.equal('You cannot process this claim since you filled it in on behalf of a visitor')
    }
  })
})
