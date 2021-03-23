const routeHelper = require('../../../helpers/routes/route-helper')
const supertest = require('supertest')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const dateFormatter = require('../../../../app/services/date-formatter')

let authorisation
let stubGetIndividualClaimDetails
let stubSubmitClaimResponse
let stubClaimDecision
let stubGetClaimExpenseResponses
let stubGetClaimLastUpdated
let stubCheckUserAndLastUpdated
let stubInsertDeduction
let stubDisableDeduction
let stubClaimDeduction
let stubGetClaimDocumentFilePath
let stubUpdateClaimOverpaymentStatus
let stubOverpaymentResponse
let stubCloseAdvanceClaim
let stubPayoutBarcodeExpiredClaim
let stubInsertNote
let stubMergeClaimExpensesWithSubmittedResponses
let stubRequestNewBankDetails
let stubInsertTopUp
let stubCancelTopUp
let stubTopupResponse
let stubUpdateEligibilityTrustedStatus
let stubUpdateAssignmentOfClaims
let stubRejectionReasonId
let stubRejectionReasons
let stubUpdateVisitorBenefirExpiryDate
let stubBenefitExpiryDate
const ValidationError = require('../../../../app/services/errors/validation-error')
const deductionTypeEnum = require('../../../../app/constants/deduction-type-enum')
const VALID_CLAIMDEDUCTION_DATA = [{ Amount: '20.00' }]
const VALID_CLAIMEXPENSE_DATA = [{ claimExpenseId: '1', approvedCost: '20.00', cost: '20.00', status: 'APPROVED' }]
const VALID_DATA_APPROVE = {
  decision: 'APPROVED',
  claimExpenses: VALID_CLAIMEXPENSE_DATA,
  claimDeductions: VALID_CLAIMDEDUCTION_DATA
}
const VALID_DATA_ADD_DEDUCTION = {
  'add-deduction': 'Submit',
  deductionType: deductionTypeEnum.HC3_DEDUCTION.value,
  deductionAmount: '1'
}
const VALID_DATA_DISABLE_DEDUCTION = {
  'remove-deduction-1': 'Remove'
}
const VALID_DATA_UPDATE_OVERPAYMENT_STATUS = {
  'overpayment-amount': '20',
  'overpayment-reason': 'cos',
  'closed-claim-action': 'OVERPAYMENT'
}
const VALID_DATA_CLOSE_ADVANCE_CLAIM = {
  'closed-claim-action': 'CLOSE-ADVANCE-CLAIM',
  'close-advance-claim-reason': 'close advance claim reason'
}

const VALID_DATA_ADD_TOP_UP = {
  'closed-claim-action': 'TOPUP',
  'top-up-amount': '140.85',
  'top-up-reason': 'Testing top up'
}
const VALID_DATA_PAYOUT_BARCODE_EXPIRED_CLAIM = {
  'payout-barcode-expired': 'PAYOUT-BARCODE-EXPIRED',
  'payout-barcode-expired-additional-information': 'Expiry reason'
}
const VALID_DATA_INSERT_NOTE = {
  'note-information': 'This is a note'
}
const INVALID_DATA_INSERT_NOTE = {
  'note-information': ''
}
const VALID_DATA_REQUEST_BANK_DETAILS = {
  'closed-claim-action': 'REQUEST-NEW-PAYMENT-DETAILS',
  'payment-details-additional-information': ''
}

const VALID_BENEFIT_EXPIRY_DATA = {
  'expiry-day-input': '20',
  'expiry-month-input': '01',
  'expiry-year-input': '2020'
}

const INCOMPLETE_DATA = {
  decision: 'REJECTED',
  reasonRejected: '',
  claimExpense: []
}
const CLAIM_RETURN = { claim: {} }

describe('routes/claim/view-claim', function () {
  let app

  beforeEach(function () {
    authorisation = { hasRoles: sinon.stub() }
    stubGetIndividualClaimDetails = sinon.stub()
    stubSubmitClaimResponse = sinon.stub()
    stubClaimDecision = sinon.stub()
    stubGetClaimExpenseResponses = sinon.stub()
    stubGetClaimLastUpdated = sinon.stub().resolves({})
    stubCheckUserAndLastUpdated = sinon.stub()
    stubInsertDeduction = sinon.stub()
    stubDisableDeduction = sinon.stub()
    stubClaimDeduction = sinon.stub()
    stubGetClaimDocumentFilePath = sinon.stub()
    stubUpdateClaimOverpaymentStatus = sinon.stub()
    stubOverpaymentResponse = sinon.stub()
    stubCloseAdvanceClaim = sinon.stub()
    stubPayoutBarcodeExpiredClaim = sinon.stub()
    stubInsertNote = sinon.stub()
    stubMergeClaimExpensesWithSubmittedResponses = sinon.stub()
    stubRequestNewBankDetails = sinon.stub()
    stubUpdateEligibilityTrustedStatus = sinon.stub()
    stubUpdateAssignmentOfClaims = sinon.stub()
    stubRejectionReasonId = sinon.stub().resolves()
    stubRejectionReasons = sinon.stub().resolves()
    stubUpdateVisitorBenefirExpiryDate = sinon.stub()
    stubBenefitExpiryDate = sinon.stub()
    stubInsertTopUp = sinon.stub().resolves()
    stubTopupResponse = sinon.stub()
    stubCancelTopUp = sinon.stub().resolves()

    const route = proxyquire('../../../../app/routes/claim/view-claim', {
      '../../services/authorisation': authorisation,
      '../../services/data/get-individual-claim-details': stubGetIndividualClaimDetails,
      '../../services/data/submit-claim-response': stubSubmitClaimResponse,
      '../../services/domain/claim-decision': stubClaimDecision,
      '../helpers/get-claim-expense-responses': stubGetClaimExpenseResponses,
      '../../services/data/get-claim-last-updated': stubGetClaimLastUpdated,
      '../../services/check-user-and-last-updated': stubCheckUserAndLastUpdated,
      '../../services/data/insert-deduction': stubInsertDeduction,
      '../../services/data/disable-deduction': stubDisableDeduction,
      '../../services/domain/claim-deduction': stubClaimDeduction,
      '../../services/data/get-claim-document-file-path': stubGetClaimDocumentFilePath,
      '../../services/data/update-claim-overpayment-status': stubUpdateClaimOverpaymentStatus,
      '../../services/domain/overpayment-response': stubOverpaymentResponse,
      '../../services/data/close-advance-claim': stubCloseAdvanceClaim,
      '../../services/data/payout-barcode-expired-claim': stubPayoutBarcodeExpiredClaim,
      '../../services/data/insert-note': stubInsertNote,
      '../helpers/merge-claim-expenses-with-submitted-responses': stubMergeClaimExpensesWithSubmittedResponses,
      '../../services/data/request-new-bank-details': stubRequestNewBankDetails,
      '../../services/data/insert-top-up': stubInsertTopUp,
      '../../services/domain/topup-response': stubTopupResponse,
      '../../services/data/cancel-top-up': stubCancelTopUp,
      '../../services/data/update-eligibility-trusted-status': stubUpdateEligibilityTrustedStatus,
      '../../services/data/update-assignment-of-claims': stubUpdateAssignmentOfClaims,
      '../../services/data/get-rejection-reasons': stubRejectionReasons,
      '../../services/data/get-rejection-reason-id': stubRejectionReasonId,
      '../../services/data/update-visitor-benefit-expiry-date': stubUpdateVisitorBenefirExpiryDate,
      '../../services/domain/benefit-expiry-date': stubBenefitExpiryDate
    })
    app = routeHelper.buildApp(route)
    route(app)
  })

  describe('GET /claim/:claimId', function () {
    it('should respond with a 200', function () {
      stubGetIndividualClaimDetails.resolves(CLAIM_RETURN)

      return supertest(app)
        .get('/claim/123')
        .expect(200)
        .expect(function () {
          expect(authorisation.hasRoles.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true //eslint-disable-line
        })
    })
  })

  describe('POST /claim/:claimId', function () {
    it('should respond with 302 when valid data entered', function () {
      const newClaimDecision = {}
      const newClaimExpenseResponse = []
      stubCheckUserAndLastUpdated.resolves()
      stubSubmitClaimResponse.resolves()
      stubClaimDecision.returns(newClaimDecision)
      stubGetClaimExpenseResponses.returns(newClaimExpenseResponse)
      stubGetIndividualClaimDetails.resolves(CLAIM_RETURN)

      return supertest(app)
        .post('/claim/123')
        .send(VALID_DATA_APPROVE)
        .expect(302)
        .expect(function () {
          expect(authorisation.hasRoles.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetClaimExpenseResponses.calledOnce).to.be.true //eslint-disable-line
          expect(stubClaimDecision.calledOnce).to.be.true //eslint-disable-line
          expect(stubSubmitClaimResponse.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true //eslint-disable-line
        })
    })

    it('should respond with a 500 for an unhandled exception', function () {
      stubCheckUserAndLastUpdated.resolves()
      stubClaimDecision.returns()
      stubGetClaimExpenseResponses.returns()
      stubSubmitClaimResponse.rejects()

      return supertest(app)
        .post('/claim/123')
        .send(VALID_DATA_APPROVE)
        .expect(500)
    })

    it('should call updateEligibilityTrustedStatus if claim decision is APPROVED', function () {
      const newClaimDecision = { decision: 'APPROVED' }
      const newClaimExpenseResponse = []
      stubCheckUserAndLastUpdated.resolves()
      stubSubmitClaimResponse.resolves()
      stubClaimDecision.returns(newClaimDecision)
      stubGetClaimExpenseResponses.returns(newClaimExpenseResponse)
      stubUpdateEligibilityTrustedStatus.resolves()
      stubGetIndividualClaimDetails.resolves(CLAIM_RETURN)

      return supertest(app)
        .post('/claim/123')
        .send(VALID_DATA_APPROVE)
        .expect(302)
        .expect(function () {
          expect(authorisation.hasRoles.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetClaimExpenseResponses.calledOnce).to.be.true //eslint-disable-line
          expect(stubClaimDecision.calledOnce).to.be.true //eslint-disable-line
          expect(stubSubmitClaimResponse.calledOnce).to.be.true //eslint-disable-line
          expect(stubUpdateEligibilityTrustedStatus.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true //eslint-disable-line
        })
    })

    it('should respond with 400 when user and user and last updated check throws validation error', function () {
      stubCheckUserAndLastUpdated.throws(new ValidationError({ reason: {} }))
      stubGetIndividualClaimDetails.resolves(CLAIM_RETURN)

      return supertest(app)
        .post('/claim/123')
        .send(VALID_DATA_APPROVE)
        .expect(400)
        .expect(function () {
          expect(authorisation.hasRoles.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true //eslint-disable-line
        })
    })

    it('should respond with 400 when invalid data entered', function () {
      stubClaimDecision.throws(new ValidationError({ reason: {} }))
      stubGetIndividualClaimDetails.resolves(CLAIM_RETURN)
      stubCheckUserAndLastUpdated.resolves()

      return supertest(app)
        .post('/claim/123')
        .send(INCOMPLETE_DATA)
        .expect(400)
        .expect(function () {
          expect(authorisation.hasRoles.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true //eslint-disable-line
        })
    })

    it('should respond with a 500 when promise is rejected', function () {
      stubCheckUserAndLastUpdated.resolves()
      stubClaimDecision.returns({})
      stubClaimDecision.rejects()

      return supertest(app)
        .post('/claim/123')
        .send(VALID_DATA_APPROVE)
        .expect(500)
    })

    it('should populate NomisCheck, DWPCheck and VisitConfirmationCheck when handling error and data is available', function () {
      const claimDetails = {
        claim: {},
        claimExpenses: [{}]
      }

      stubCheckUserAndLastUpdated.resolves()
      stubGetClaimExpenseResponses.returns([{}])
      stubSubmitClaimResponse.throws(new ValidationError())
      stubGetIndividualClaimDetails.resolves(claimDetails)
      stubMergeClaimExpensesWithSubmittedResponses.returns()

      return supertest(app)
        .post('/claim/123')
        .send(VALID_DATA_APPROVE)
        .expect(function () {
          expect(stubMergeClaimExpensesWithSubmittedResponses.calledOnce).to.be.true //eslint-disable-line
        })
    })
  })

  describe('GET /claim/:claimId/download', function () {
    const CLAIM_DOCUMENT = {
      Filepath: 'test/resources/testfile.txt'
    }

    it('should respond respond with 200 if a valid file path is returned', function () {
      stubGetClaimDocumentFilePath.resolves(CLAIM_DOCUMENT)
      return supertest(app)
        .get('/claim/123/download?claim-document-id=55')
        .expect(200)
        .expect('content-length', '4')
    })

    it('should respond with 500 if no claim-document-id provided', function () {
      return supertest(app)
        .get('/claim/123/download')
        .expect(500)
    })

    it('should respond with 500 if no file path is provided', function () {
      stubGetClaimDocumentFilePath.resolves()
      return supertest(app)
        .get('/claim/123/download?claim-document-id=55')
        .expect(500)
    })
  })

  describe('POST /claim/:claimId/add-deduction', function () {
    it('should respond with 400 when user and last updated check throws validation error', function () {
      stubCheckUserAndLastUpdated.throws(new ValidationError({ reason: {} }))
      stubGetIndividualClaimDetails.resolves(CLAIM_RETURN)

      return supertest(app)
        .post('/claim/123/add-deduction')
        .send(VALID_DATA_ADD_DEDUCTION)
        .expect(400)
        .expect(function () {
          expect(authorisation.hasRoles.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true //eslint-disable-line
        })
    })

    it('should respond with 400 including extra data if claim expenses exist and there is no update conflict when a validation error occurs', function () {
      const claimData = {
        claim: {},
        claimExpenses: {}
      }
      stubCheckUserAndLastUpdated.resolves()
      stubGetIndividualClaimDetails.resolves(claimData)
      stubClaimDecision.returns({})
      stubInsertDeduction.throws(new ValidationError())
      stubMergeClaimExpensesWithSubmittedResponses.returns({})

      return supertest(app)
        .post('/claim/123/add-deduction')
        .send(VALID_DATA_ADD_DEDUCTION)
        .expect(400)
        .expect(function () {
          expect(authorisation.hasRoles.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true //eslint-disable-line
        })
    })

    it('should respond with 302 when valid data entered (add deduction)', function () {
      const claimData = {
        claim: {},
        claimExpenses: {}
      }
      const testClaimDecisionObject = { deductionType: 'a', amount: '5' }
      stubCheckUserAndLastUpdated.resolves()
      stubInsertDeduction.resolves({})
      stubClaimDeduction.returns(testClaimDecisionObject)
      stubGetClaimExpenseResponses.returns([{}])
      stubGetIndividualClaimDetails.resolves(claimData)

      return supertest(app)
        .post('/claim/123/add-deduction')
        .send(VALID_DATA_ADD_DEDUCTION)
        .expect(302)
        .expect(function () {
          expect(stubInsertDeduction.calledWith('123', testClaimDecisionObject)).to.be.true //eslint-disable-line
        })
    })

    it('should respond with a 500 when promise is rejected', function () {
      stubCheckUserAndLastUpdated.resolves()
      stubInsertDeduction.rejects()

      return supertest(app)
        .post('/claim/123/add-deduction')
        .send(VALID_DATA_ADD_DEDUCTION)
        .expect(500)
    })
  })

  describe('POST /claim/:claimId/remove-deduction', function () {
    it('should respond with 400 when user and last updated check throws validation error', function () {
      stubCheckUserAndLastUpdated.throws(new ValidationError({ reason: {} }))
      stubGetIndividualClaimDetails.resolves(CLAIM_RETURN)

      return supertest(app)
        .post('/claim/123/remove-deduction')
        .send(VALID_DATA_ADD_DEDUCTION)
        .expect(400)
        .expect(function () {
          expect(authorisation.hasRoles.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true //eslint-disable-line
        })
    })

    it('should respond with 302 when valid data entered (disable deduction)', function () {
      const claimData = {
        claim: {},
        claimExpenses: {}
      }
      stubCheckUserAndLastUpdated.resolves()
      stubDisableDeduction.resolves({})
      stubGetIndividualClaimDetails.resolves(claimData)

      return supertest(app)
        .post('/claim/123/remove-deduction')
        .send(VALID_DATA_DISABLE_DEDUCTION)
        .expect(302)
        .expect(function () {
          expect(stubDisableDeduction.calledWith('1')).to.be.true //eslint-disable-line
        })
    })

    it('should respond with a 500 when promise is rejected', function () {
      stubCheckUserAndLastUpdated.resolves()
      stubDisableDeduction.rejects()

      return supertest(app)
        .post('/claim/123/remove-deduction')
        .send(VALID_DATA_DISABLE_DEDUCTION)
        .expect(500)
    })
  })

  describe('POST /claim/:claimId/assign-self', function () {
    it('should respond with 400 when user and last updated check throws validation error', function () {
      stubCheckUserAndLastUpdated.throws(new ValidationError({ reason: {} }))
      stubGetIndividualClaimDetails.resolves(CLAIM_RETURN)

      return supertest(app)
        .post('/claim/123/assign-self')
        .send()
        .expect(400)
        .expect(function () {
          expect(authorisation.hasRoles.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true //eslint-disable-line
        })
    })

    it('should respond with 200 after calling assignment with users email if no conflicts', function () {
      const claimData = {
        claim: {},
        claimExpenses: {}
      }
      stubCheckUserAndLastUpdated.resolves()
      stubUpdateAssignmentOfClaims.resolves()
      stubGetIndividualClaimDetails.resolves(claimData)

      return supertest(app)
        .post('/claim/123/assign-self')
        .send()
        .expect(302)
        .expect(function () {
          expect(stubUpdateAssignmentOfClaims.calledWith('123', 'test@test.com')).to.be.true //eslint-disable-line
        })
    })

    it('should respond with a 500 when promise is rejected', function () {
      stubCheckUserAndLastUpdated.resolves()
      stubUpdateAssignmentOfClaims.rejects()

      return supertest(app)
        .post('/claim/123/assign-self')
        .send()
        .expect(500)
    })
  })

  describe('POST /claim/:claimId/unassign', function () {
    it('should respond with 400 when user and last updated check throws validation error', function () {
      stubCheckUserAndLastUpdated.throws(new ValidationError({ reason: {} }))
      stubGetIndividualClaimDetails.resolves(CLAIM_RETURN)

      return supertest(app)
        .post('/claim/123/unassign')
        .send()
        .expect(400)
        .expect(function () {
          expect(authorisation.hasRoles.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true //eslint-disable-line
        })
    })

    it('should respond with 200 after calling assignment with users email if no conflicts', function () {
      const claimData = {
        claim: {},
        claimExpenses: {}
      }
      stubCheckUserAndLastUpdated.resolves()
      stubUpdateAssignmentOfClaims.resolves()
      stubGetIndividualClaimDetails.resolves(claimData)

      return supertest(app)
        .post('/claim/123/unassign')
        .send()
        .expect(302)
        .expect(function () {
          expect(stubUpdateAssignmentOfClaims.calledWith('123', null)).to.be.true //eslint-disable-line
        })
    })

    it('should respond with a 500 when promise is rejected', function () {
      stubCheckUserAndLastUpdated.resolves()
      stubUpdateAssignmentOfClaims.rejects()

      return supertest(app)
        .post('/claim/123/unassign')
        .send()
        .expect(500)
    })
  })

  describe('POST /claim/:claimId/update-overpayment-status', function () {
    it('should respond with 400 when user and last updated check throws validation error', function () {
      stubGetIndividualClaimDetails.resolves(CLAIM_RETURN)
      stubCheckUserAndLastUpdated.throws(new ValidationError({ reason: {} }))

      return supertest(app)
        .post('/claim/123/update-overpayment-status')
        .send(VALID_DATA_UPDATE_OVERPAYMENT_STATUS)
        .expect(400)
        .expect(function () {
          expect(authorisation.hasRoles.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true //eslint-disable-line
        })
    })

    it('should respond with 302 when valid data entered', function () {
      const claimData = { claim: { IsOverpaid: false } }
      const overpaymentResponse = {}
      stubGetIndividualClaimDetails.resolves(claimData)
      stubOverpaymentResponse.returns(overpaymentResponse)
      stubUpdateClaimOverpaymentStatus.resolves()
      stubCheckUserAndLastUpdated.resolves()

      return supertest(app)
        .post('/claim/123/update-overpayment-status')
        .send(VALID_DATA_UPDATE_OVERPAYMENT_STATUS)
        .expect(302)
        .expect(function () {
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubUpdateClaimOverpaymentStatus.calledWith(claimData.claim, overpaymentResponse)).to.be.true //eslint-disable-line
        })
    })

    it('should respond with 400 when adding an overpayment and a validation error occurs', function () {
      const claimData = { claim: { IsOverpaid: false } }
      const overpaymentResponse = {}
      stubGetIndividualClaimDetails.resolves(claimData)
      stubOverpaymentResponse.returns(overpaymentResponse)
      stubCheckUserAndLastUpdated.resolves()
      stubUpdateClaimOverpaymentStatus.throws(new ValidationError())

      return supertest(app)
        .post('/claim/123/update-overpayment-status')
        .send(VALID_DATA_UPDATE_OVERPAYMENT_STATUS)
        .expect(400)
        .expect(function () {
          expect(authorisation.hasRoles.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true //eslint-disable-line
          expect(stubUpdateClaimOverpaymentStatus.calledOnce).to.be.true //eslint-disable-line
        })
    })

    it('should respond with a 500 when promise is rejected', function () {
      stubCheckUserAndLastUpdated.resolves()
      stubGetIndividualClaimDetails.resolves(CLAIM_RETURN)
      stubOverpaymentResponse.resolves({})
      stubUpdateClaimOverpaymentStatus.rejects()

      return supertest(app)
        .post('/claim/123/update-overpayment-status')
        .send(VALID_DATA_DISABLE_DEDUCTION)
        .expect(500)
    })
  })

  describe('POST /claim/:claimId/payout-barcode-expired', function () {
    it('should respond with 400 when user and last updated check throws validation error', function () {
      stubGetIndividualClaimDetails.resolves(CLAIM_RETURN)
      stubCheckUserAndLastUpdated.throws(new ValidationError({ reason: {} }))

      return supertest(app)
        .post('/claim/123/payout-barcode-expired')
        .send(VALID_DATA_PAYOUT_BARCODE_EXPIRED_CLAIM)
        .expect(400)
        .expect(function () {
          expect(authorisation.hasRoles.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true //eslint-disable-line
        })
    })

    it('should respond with 302 when valid data entered', function () {
      stubPayoutBarcodeExpiredClaim.resolves()
      stubCheckUserAndLastUpdated.resolves()

      return supertest(app)
        .post('/claim/123/payout-barcode-expired')
        .send(VALID_DATA_PAYOUT_BARCODE_EXPIRED_CLAIM)
        .expect(302)
        .expect(function () {
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubPayoutBarcodeExpiredClaim.calledWith('123', 'Expiry reason')).to.be.true //eslint-disable-line
        })
    })

    it('should respond with 400 when marking claim as payout expired and a validation error occurs', function () {
      stubPayoutBarcodeExpiredClaim.throws(new ValidationError())
      stubGetIndividualClaimDetails.resolves(CLAIM_RETURN)
      stubCheckUserAndLastUpdated.resolves()

      return supertest(app)
        .post('/claim/123/payout-barcode-expired')
        .send(VALID_DATA_PAYOUT_BARCODE_EXPIRED_CLAIM)
        .expect(function () {
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetIndividualClaimDetails.calledOnce).to.be.true //eslint-disable-line
        })
    })

    it('should respond with a 500 when promise is rejected', function () {
      stubPayoutBarcodeExpiredClaim.rejects()
      stubGetIndividualClaimDetails.resolves(CLAIM_RETURN)
      stubCheckUserAndLastUpdated.resolves()

      return supertest(app)
        .post('/claim/123/payout-barcode-expired')
        .send(VALID_DATA_PAYOUT_BARCODE_EXPIRED_CLAIM)
        .expect(500)
    })
  })

  describe('POST /claim/:claimId/insert-note', function () {
    it('should respond with 302 when valid data entered', function () {
      stubInsertNote.resolves()
      stubCheckUserAndLastUpdated.resolves()

      return supertest(app)
        .post('/claim/123/insert-note')
        .send(VALID_DATA_INSERT_NOTE)
        .expect(302)
        .expect(function () {
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubInsertNote.calledWith('123', 'This is a note')).to.be.true //eslint-disable-line
        })
    })

    it('should respond with a 500 when no field blank', function () {
      stubInsertNote.resolves()
      stubCheckUserAndLastUpdated.resolves()

      return supertest(app)
        .post('/claim/123/insert-note')
        .send(INVALID_DATA_INSERT_NOTE)
        .expect(500)
    })
  })

  describe('POST /claim/:claimId/close-advance-claim', function () {
    it('should respond with 400 when user and last updated check throws validation error', function () {
      stubGetIndividualClaimDetails.resolves(CLAIM_RETURN)
      stubCheckUserAndLastUpdated.throws(new ValidationError({ reason: {} }))

      return supertest(app)
        .post('/claim/123/close-advance-claim')
        .send(VALID_DATA_CLOSE_ADVANCE_CLAIM)
        .expect(400)
        .expect(function () {
          expect(authorisation.hasRoles.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true //eslint-disable-line
        })
    })

    it('should respond with 302 when valid data entered', function () {
      stubCloseAdvanceClaim.resolves()
      stubCheckUserAndLastUpdated.resolves()

      return supertest(app)
        .post('/claim/123/close-advance-claim')
        .send(VALID_DATA_CLOSE_ADVANCE_CLAIM)
        .expect(302)
        .expect(function () {
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubCloseAdvanceClaim.calledWith('123', 'close advance claim reason')).to.be.true //eslint-disable-line
        })
    })

    it('should respond with 400 when closing claim and a validation error occurs', function () {
      stubCloseAdvanceClaim.throws(new ValidationError())
      stubGetIndividualClaimDetails.resolves(CLAIM_RETURN)
      stubCheckUserAndLastUpdated.resolves()

      return supertest(app)
        .post('/claim/123/close-advance-claim')
        .send(VALID_DATA_CLOSE_ADVANCE_CLAIM)
        .expect(function () {
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetIndividualClaimDetails.calledOnce).to.be.true //eslint-disable-line
        })
    })

    it('should respond with a 500 when promise is rejected', function () {
      stubCloseAdvanceClaim.rejects()
      stubGetIndividualClaimDetails.resolves(CLAIM_RETURN)
      stubCheckUserAndLastUpdated.resolves()

      return supertest(app)
        .post('/claim/123/close-advance-claim')
        .send(VALID_DATA_DISABLE_DEDUCTION)
        .expect(500)
    })
  })

  describe('POST /claim/:claimId/request-new-payment-details', function () {
    it('should respond with 400 when user and last updated check throws validation error', function () {
      stubGetIndividualClaimDetails.resolves(CLAIM_RETURN)
      stubCheckUserAndLastUpdated.throws(new ValidationError({ reason: {} }))

      return supertest(app)
        .post('/claim/123/request-new-payment-details')
        .send(VALID_DATA_REQUEST_BANK_DETAILS)
        .expect(400)
        .expect(function () {
          expect(authorisation.hasRoles.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true //eslint-disable-line
        })
    })

    it('should respond with 302 when request bank details submitted', function () {
      stubRequestNewBankDetails.resolves()
      stubCheckUserAndLastUpdated.resolves()
      stubGetIndividualClaimDetails.resolves({
        claim: {
          Reference: 'NEWBANK',
          EligibilityId: '1'
        },
        TopUps: {
          allTopUpsPaid: true
        }
      })

      return supertest(app)
        .post('/claim/123/request-new-payment-details')
        .send(VALID_DATA_REQUEST_BANK_DETAILS)
        .expect(302)
        .expect(function () {
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubRequestNewBankDetails.calledWith('NEWBANK', '1', '123', '', 'test@test.com')).to.be.true //eslint-disable-line
        })
    })

    it('should respond with a 500 when promise is rejected', function () {
      stubCloseAdvanceClaim.rejects()
      stubGetIndividualClaimDetails.resolves({})
      stubCheckUserAndLastUpdated.resolves()

      return supertest(app)
        .post('/claim/123/request-new-payment-details')
        .send(VALID_DATA_DISABLE_DEDUCTION)
        .expect(500)
    })
  })

  describe('POST /claim/:claimId/update-benefit-expiry-date', function () {
    it('should respond with 302 when valid benefit expiry date is entered', function () {
      const claimData = {
        claim: {},
        claimExpenses: {}
      }
      stubCheckUserAndLastUpdated.resolves()
      stubUpdateVisitorBenefirExpiryDate.resolves()
      stubGetIndividualClaimDetails.resolves(claimData)

      const benefitExpiryDate = {
        expiryDateFields: [VALID_BENEFIT_EXPIRY_DATA['expiry-day-input'], VALID_BENEFIT_EXPIRY_DATA['expiry-month-input'], VALID_BENEFIT_EXPIRY_DATA['expiry-year-input']],
        expiryDate: dateFormatter.build(VALID_BENEFIT_EXPIRY_DATA['expiry-day-input'], VALID_BENEFIT_EXPIRY_DATA['expiry-month-input'], VALID_BENEFIT_EXPIRY_DATA['expiry-year-input'])
      }

      stubBenefitExpiryDate.returns(benefitExpiryDate)

      return supertest(app)
        .post('/claim/123/update-benefit-expiry-date')
        .send(VALID_BENEFIT_EXPIRY_DATA)
        .expect(302)
        .expect(function () {
          expect(stubUpdateVisitorBenefirExpiryDate.calledWith('123', benefitExpiryDate)).to.be.true //eslint-disable-line
        })
    })
  })

  describe('POST /claim/:claimId/add-top-up', function () {
    it('should respond with 302 when valid top up data entered', function () {
      stubCheckUserAndLastUpdated.resolves()
      stubInsertTopUp.resolves(VALID_DATA_ADD_TOP_UP)
      stubGetIndividualClaimDetails.resolves({
        claim: {
          Reference: 'TOPUP',
          EligibilityId: '1',
          PaymentStatus: 'PROCESSED'
        },
        TopUps: {
          allTopUpsPaid: true
        }
      })

      const topUpResponse = {
        amount: VALID_DATA_ADD_TOP_UP['top-up-amount'],
        reason: VALID_DATA_ADD_TOP_UP['top-up-reason']
      }
      stubTopupResponse.returns(topUpResponse)

      return supertest(app)
        .post('/claim/123/add-top-up')
        .send(VALID_DATA_ADD_TOP_UP)
        .expect(302)
        .expect(function () {
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubInsertTopUp.calledOnce).to.be.true //eslint-disable-line
          expect(stubInsertTopUp.calledWith({Reference: 'TOPUP', EligibilityId: '1', PaymentStatus: 'PROCESSED'}, topUpResponse, 'test@test.com')).to.be.true //eslint-disable-line
        })
    })
  })

  describe('POST /claim/:claimId/cancel-top-up', function () {
    it('should respond with 302 when valid cancel top up data is sent', function () {
      stubCheckUserAndLastUpdated.resolves()
      stubCancelTopUp.resolves()
      stubGetIndividualClaimDetails.resolves({
        claim: {
          Reference: 'CANCEL',
          EligibilityId: '1',
          PaymentStatus: 'PROCESSED'
        },
        TopUps: {
          allTopUpsPaid: true
        }
      })

      return supertest(app)
        .post('/claim/123/cancel-top-up')
        .send()
        .expect(302)
        .expect(function () {
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true //eslint-disable-line
          expect(stubCancelTopUp.calledOnce).to.be.true //eslint-disable-line
          expect(stubCancelTopUp.calledWith({Reference: 'CANCEL', EligibilityId: '1', PaymentStatus: 'PROCESSED'}, 'test@test.com')).to.be.true //eslint-disable-line
        })
    })
  })
})
