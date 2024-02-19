const ClaimDecision = require('../../../../app/services/domain/claim-decision')
const ValidationError = require('../../../../app/services/errors/validation-error')
const expect = require('chai').expect
let claimDecision
const dateFormatter = require('../../../../app/services/date-formatter')

describe('services/domain/claim-decision', function () {
  const VALID_CASEWORKER = 'adam@adams.gov'
  const VALID_ASSISTED_DIGITAL_CASEWORKER = 'betty@barnes.gov'
  const VALID_DECISION_REJECTED = 'REJECTED'
  const VALID_DECISION_REQUESTED = 'REQUEST_INFORMATION'
  const VALID_DECISION_APPROVED = 'APPROVED'
  const VALID_NOTE_REJECTION = 'rejection note'
  const VALID_CLAIMEXPENSES = [{ claimExpenseId: '1', approvedCost: '20.00', cost: '20.00', status: 'APPROVED' }]
  const VALID_CLAIMEXPENSES_REJECTED = [{ claimExpenseId: '1', approvedCost: '20.00', cost: '20.00', status: 'REJECTED' }]
  const INVALID_CLAIMEXPENSES = [{ claimExpenseId: '1', approvedCost: '20.00', cost: '-1', status: 'APPROVED' }]
  const VALID_CLAIMDEDUCTION = [{ Amount: '10.00' }]
  const VALID_NOMIS_CHECK = 'APPROVED'
  const VALID_DWP_CHECK = 'APPROVED'
  const VALID_VISIT_CONFIRMATION_CHECK = 'APPROVED'
  const NOT_ADVANCE_CLAIM = false
  const ADVANCE_CLAIM = true
  const futureDate = dateFormatter.now().add(1, 'days')
  const futureDay = futureDate.format('D')
  const futureMonth = futureDate.format('M')
  const futureYear = futureDate.format('YYYY')
  const pastDate = dateFormatter.now().subtract(1, 'days')
  const pastDay = pastDate.format('D')
  const pastMonth = pastDate.format('M')
  const pastYear = pastDate.format('YYYY')

  it('should construct a domain object given valid input', function () {
    console.log(pastDay)
    console.log(pastMonth)
    console.log(pastYear)
    claimDecision = new ClaimDecision(VALID_CASEWORKER, VALID_ASSISTED_DIGITAL_CASEWORKER, VALID_DECISION_REJECTED, '', '', VALID_NOTE_REJECTION, VALID_NOMIS_CHECK, VALID_DWP_CHECK, VALID_VISIT_CONFIRMATION_CHECK, VALID_CLAIMEXPENSES, VALID_CLAIMDEDUCTION, NOT_ADVANCE_CLAIM, null, null, futureDay, futureMonth, futureYear)
    expect(claimDecision.decision).to.equal(VALID_DECISION_REJECTED)
    expect(claimDecision.nomisCheck).to.equal(VALID_NOMIS_CHECK)
    expect(claimDecision.dwpCheck).to.equal(VALID_DWP_CHECK)
    expect(claimDecision.visitConfirmationCheck).to.equal(VALID_VISIT_CONFIRMATION_CHECK)
  })

  it('should construct a domain object given valid input but no visit confirmation as advance claim', function () {
    claimDecision = new ClaimDecision(VALID_CASEWORKER, VALID_ASSISTED_DIGITAL_CASEWORKER, VALID_DECISION_REJECTED, '', '', VALID_NOTE_REJECTION, VALID_NOMIS_CHECK, VALID_DWP_CHECK, '', VALID_CLAIMEXPENSES, VALID_CLAIMDEDUCTION, ADVANCE_CLAIM, null, null, futureDay, futureMonth, futureYear)
    expect(claimDecision.decision).to.equal(VALID_DECISION_REJECTED)
    expect(claimDecision.nomisCheck).to.equal(VALID_NOMIS_CHECK)
    expect(claimDecision.dwpCheck).to.equal(VALID_DWP_CHECK)
    expect(claimDecision.visitConfirmationCheck).to.equal('')
  })

  it('should return isRequired error for decision given empty strings', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, VALID_ASSISTED_DIGITAL_CASEWORKER, '', '', '', VALID_NOTE_REJECTION, VALID_NOMIS_CHECK, VALID_DWP_CHECK, VALID_VISIT_CONFIRMATION_CHECK, VALID_CLAIMEXPENSES, VALID_CLAIMDEDUCTION, NOT_ADVANCE_CLAIM, null, null, futureDay, futureMonth, futureYear)
      expect(false, 'should have thrown validation error').to.be.true //eslint-disable-line
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors.decision[0]).to.equal('Decision is required')
    }
  })

  it('should return isRequired error for note given on reject', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, '', VALID_DECISION_REJECTED, '', '', '', VALID_NOMIS_CHECK, '', VALID_VISIT_CONFIRMATION_CHECK, VALID_CLAIMEXPENSES, VALID_CLAIMDEDUCTION, NOT_ADVANCE_CLAIM, null, null, futureDay, futureMonth, futureYear)
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['additional-info-reject'][0]).to.equal('More information needed')
    }
  })

  it('should return isRequired error for note given on request information', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, '', VALID_DECISION_REQUESTED, '', '', '', VALID_NOMIS_CHECK, '', VALID_VISIT_CONFIRMATION_CHECK, VALID_CLAIMEXPENSES, VALID_CLAIMDEDUCTION, NOT_ADVANCE_CLAIM, null, null, futureDay, futureMonth, futureYear)
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['additional-info-request'][0]).to.equal('More information needed')
    }
  })

  it('should return isRequired error for nomis-check given empty strings', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, '', '', '', '', '', '', '', VALID_VISIT_CONFIRMATION_CHECK, VALID_CLAIMEXPENSES, VALID_CLAIMDEDUCTION, NOT_ADVANCE_CLAIM, null, null, futureDay, futureMonth, futureYear)
      expect(false, 'should have thrown validation error').to.be.true //eslint-disable-line
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['nomis-check'][0]).to.equal('Decide on prisoner check')
    }
  })

  it('should return isRequired error for dwp-check given empty strings', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, '', '', '', '', '', '', '', VALID_VISIT_CONFIRMATION_CHECK, VALID_CLAIMEXPENSES, VALID_CLAIMDEDUCTION, NOT_ADVANCE_CLAIM, null, null, futureDay, futureMonth, futureYear)
      expect(false, 'should have thrown validation error').to.be.true //eslint-disable-line
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['dwp-check'][0]).to.equal('Decide if benefit check needed')
    }
  })

  it('should return isRequired error for visit-confirmation-check given empty strings', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, '', '', '', '', '', '', '', '', VALID_CLAIMEXPENSES, VALID_CLAIMDEDUCTION, NOT_ADVANCE_CLAIM, null, null, futureDay, futureMonth, futureYear)
      expect(false, 'should have thrown validation error').to.be.true //eslint-disable-line
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['visit-confirmation-check'][0]).to.equal('Decide on visit confirmation')
    }
  })

  it('should return error for invalid claim expenses', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, '', '', '', '', '', '', '', VALID_VISIT_CONFIRMATION_CHECK, INVALID_CLAIMEXPENSES, VALID_CLAIMDEDUCTION, NOT_ADVANCE_CLAIM, null, null, futureDay, futureMonth, futureYear)
      expect(false, 'should have thrown validation error').to.be.true //eslint-disable-line
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['approve-cost'][0]).to.equal('New approved cost must be greater than zero')
    }
  })

  it('should return error if approving with all expenses rejected', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, '', VALID_DECISION_APPROVED, '', '', '', '', '', VALID_VISIT_CONFIRMATION_CHECK, VALID_CLAIMEXPENSES_REJECTED, VALID_CLAIMDEDUCTION, NOT_ADVANCE_CLAIM, null, null, futureDay, futureMonth, futureYear)
      expect(false, 'should have thrown validation error').to.be.true //eslint-disable-line
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['claim-expenses'][0]).to.equal('At least one expense must not be rejected for the claim to be approved')
    }
  })

  it('should return error if same caseworker as assisted digital caseworker', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, VALID_CASEWORKER, '', '', '', '', '', '', VALID_VISIT_CONFIRMATION_CHECK, VALID_CLAIMEXPENSES_REJECTED, VALID_CLAIMDEDUCTION, NOT_ADVANCE_CLAIM, null, null, futureDay, futureMonth, futureYear)
      expect(false, 'should have thrown validation error').to.be.true //eslint-disable-line
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['assisted-digital-caseworker'][0]).to.equal('You cannot process this claim since you filled it in on behalf of a visitor')
    }
  })

  it('should return error if the "Other" Reason is chosen and a manual rejection reason is not entered', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, '', VALID_DECISION_REJECTED, '', '', 'Other', '', '', VALID_VISIT_CONFIRMATION_CHECK, VALID_CLAIMEXPENSES_REJECTED, VALID_CLAIMDEDUCTION, NOT_ADVANCE_CLAIM, 13, '', futureDay, futureMonth, futureYear)
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['additional-info-reject-manual'][0]).to.equal('More information needed')
    }
  })

  it('should return an error if the benefit expiry date boxes are blank', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, '', VALID_DECISION_REJECTED, '', '', 'Other', '', '', VALID_VISIT_CONFIRMATION_CHECK, VALID_CLAIMEXPENSES_REJECTED, VALID_CLAIMDEDUCTION, NOT_ADVANCE_CLAIM, 13, '', '', '', '')
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['benefit-expiry'][0]).to.equal('Please enter the Benefit Expiry date')
    }
  })

  it('should return error if the Release Date checkbox is checked and the release date boxes are blank', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, '', VALID_DECISION_REJECTED, '', '', 'Other', '', '', VALID_VISIT_CONFIRMATION_CHECK, VALID_CLAIMEXPENSES_REJECTED, VALID_CLAIMDEDUCTION, NOT_ADVANCE_CLAIM, 13, '', '', '', '', 'on', '', '', '')
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['release-date-section'][0]).to.equal('Please enter the release date')
    }
  })

  it('should return error if the Release Date checkbox is checked and the release date boxes contain a past date', function () {
    try {
      claimDecision = new ClaimDecision(VALID_CASEWORKER, '', VALID_DECISION_REJECTED, '', '', 'Other', '', '', VALID_VISIT_CONFIRMATION_CHECK, VALID_CLAIMEXPENSES_REJECTED, VALID_CLAIMDEDUCTION, NOT_ADVANCE_CLAIM, 13, '', '22', '4', '2019', 'on', '22', '4', '2020')
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['release-date-section'][0]).to.equal('Release Date must be in the future')
    }
  })
})
