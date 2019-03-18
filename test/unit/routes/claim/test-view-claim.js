const routeHelper = require('../../../helpers/routes/route-helper')
const supertest = require('supertest')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

var authorisation
var stubGetIndividualClaimDetails
var stubSubmitClaimResponse
var stubClaimDecision
var stubGetClaimExpenseResponses
var stubGetClaimLastUpdated
var stubCheckUserAndLastUpdated
var stubInsertDeduction
var stubDisableDeduction
var stubClaimDeduction
var stubGetClaimDocumentFilePath
var stubUpdateClaimOverpaymentStatus
var stubOverpaymentResponse
var stubCloseAdvanceClaim
var stubPayoutBarcodeExpiredClaim
var stubInsertNote
var stubMergeClaimExpensesWithSubmittedResponses
var stubRequestNewBankDetails
var stubUpdateEligibilityTrustedStatus
var stubUpdateAssignmentOfClaims
var stubRejectionReasonId
var stubRejectionReasons
var ValidationError = require('../../../../app/services/errors/validation-error')
var deductionTypeEnum = require('../../../../app/constants/deduction-type-enum')
const VALID_CLAIMDEDUCTION_DATA = [{Amount: '20.00'}]
const VALID_CLAIMEXPENSE_DATA = [{claimExpenseId: '1', approvedCost: '20.00', cost: '20.00', status: 'APPROVED'}]
const VALID_DATA_APPROVE = {
  'decision': 'APPROVED',
  'claimExpenses': VALID_CLAIMEXPENSE_DATA,
  'claimDeductions': VALID_CLAIMDEDUCTION_DATA
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
const INCOMPLETE_DATA = {
  'decision': 'REJECTED',
  'reasonRejected': '',
  'claimExpense': []
}
const CLAIM_RETURN = {claim: {}}

describe('routes/claim/view-claim', function () {
  var app

  beforeEach(function () {
    authorisation = { isCaseworker: sinon.stub() }
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

    var route = proxyquire('../../../../app/routes/claim/view-claim', {
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
      '../../services/data/update-eligibility-trusted-status': stubUpdateEligibilityTrustedStatus,
      '../../services/data/update-assignment-of-claims': stubUpdateAssignmentOfClaims,
      '../../services/data/get-rejection-reasons': stubRejectionReasons,
      '../../services/data/get-rejection-reason-id': stubRejectionReasonId
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
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
        })
    })
  })

  describe('POST /claim/:claimId', function () {
    it('should respond with 302 when valid data entered', function () {
      var newClaimDecision = {}
      var newClaimExpenseResponse = []
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
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true
          expect(stubGetClaimExpenseResponses.calledOnce).to.be.true
          expect(stubClaimDecision.calledOnce).to.be.true
          expect(stubSubmitClaimResponse.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
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
      var newClaimDecision = {decision: 'APPROVED'}
      var newClaimExpenseResponse = []
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
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true
          expect(stubGetClaimExpenseResponses.calledOnce).to.be.true
          expect(stubClaimDecision.calledOnce).to.be.true
          expect(stubSubmitClaimResponse.calledOnce).to.be.true
          expect(stubUpdateEligibilityTrustedStatus.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
        })
    })

    it('should respond with 400 when user and user and last updated check throws validation error', function () {
      stubCheckUserAndLastUpdated.throws(new ValidationError({ 'reason': {} }))
      stubGetIndividualClaimDetails.resolves(CLAIM_RETURN)

      return supertest(app)
        .post('/claim/123')
        .send(VALID_DATA_APPROVE)
        .expect(400)
        .expect(function () {
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
        })
    })

    it('should respond with 400 when invalid data entered', function () {
      stubClaimDecision.throws(new ValidationError({ 'reason': {} }))
      stubGetIndividualClaimDetails.resolves(CLAIM_RETURN)
      stubCheckUserAndLastUpdated.resolves()

      return supertest(app)
        .post('/claim/123')
        .send(INCOMPLETE_DATA)
        .expect(400)
        .expect(function () {
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
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
      var claimDetails = {
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
          expect(stubMergeClaimExpensesWithSubmittedResponses.calledOnce).to.be.true
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
      stubCheckUserAndLastUpdated.throws(new ValidationError({ 'reason': {} }))
      stubGetIndividualClaimDetails.resolves(CLAIM_RETURN)

      return supertest(app)
        .post('/claim/123/add-deduction')
        .send(VALID_DATA_ADD_DEDUCTION)
        .expect(400)
        .expect(function () {
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
        })
    })

    it('should respond with 400 including extra data if claim expenses exist and there is no update conflict when a validation error occurs', function () {
      var claimData = {
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
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
        })
    })

    it('should respond with 200 when valid data entered (add deduction)', function () {
      var claimData = {
        claim: {},
        claimExpenses: {}
      }
      var testClaimDecisionObject = {deductionType: 'a', amount: '5'}
      stubCheckUserAndLastUpdated.resolves()
      stubInsertDeduction.resolves({})
      stubClaimDeduction.returns(testClaimDecisionObject)
      stubGetClaimExpenseResponses.returns([{}])
      stubGetIndividualClaimDetails.resolves(claimData)

      return supertest(app)
        .post('/claim/123/add-deduction')
        .send(VALID_DATA_ADD_DEDUCTION)
        .expect(200)
        .expect(function () {
          expect(stubInsertDeduction.calledWith('123', testClaimDecisionObject)).to.be.true
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
      stubCheckUserAndLastUpdated.throws(new ValidationError({ 'reason': {} }))
      stubGetIndividualClaimDetails.resolves(CLAIM_RETURN)

      return supertest(app)
        .post('/claim/123/remove-deduction')
        .send(VALID_DATA_ADD_DEDUCTION)
        .expect(400)
        .expect(function () {
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
        })
    })

    it('should respond with 200 when valid data entered (disable deduction)', function () {
      var claimData = {
        claim: {},
        claimExpenses: {}
      }
      stubCheckUserAndLastUpdated.resolves()
      stubDisableDeduction.resolves({})
      stubGetIndividualClaimDetails.resolves(claimData)

      return supertest(app)
        .post('/claim/123/remove-deduction')
        .send(VALID_DATA_DISABLE_DEDUCTION)
        .expect(200)
        .expect(function () {
          expect(stubDisableDeduction.calledWith('1')).to.be.true
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
      stubCheckUserAndLastUpdated.throws(new ValidationError({ 'reason': {} }))
      stubGetIndividualClaimDetails.resolves(CLAIM_RETURN)

      return supertest(app)
        .post('/claim/123/assign-self')
        .send()
        .expect(400)
        .expect(function () {
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
        })
    })

    it('should respond with 200 after calling assignment with users email if no conflicts', function () {
      var claimData = {
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
          expect(stubUpdateAssignmentOfClaims.calledWith('123', 'test@test.com')).to.be.true
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
      stubCheckUserAndLastUpdated.throws(new ValidationError({ 'reason': {} }))
      stubGetIndividualClaimDetails.resolves(CLAIM_RETURN)

      return supertest(app)
        .post('/claim/123/unassign')
        .send()
        .expect(400)
        .expect(function () {
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
        })
    })

    it('should respond with 200 after calling assignment with users email if no conflicts', function () {
      var claimData = {
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
          expect(stubUpdateAssignmentOfClaims.calledWith('123', null)).to.be.true
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
      stubCheckUserAndLastUpdated.throws(new ValidationError({ 'reason': {} }))

      return supertest(app)
        .post('/claim/123/update-overpayment-status')
        .send(VALID_DATA_UPDATE_OVERPAYMENT_STATUS)
        .expect(400)
        .expect(function () {
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
        })
    })

    it('should respond with 302 when valid data entered', function () {
      var claimData = { claim: { IsOverpaid: false } }
      var overpaymentResponse = {}
      stubGetIndividualClaimDetails.resolves(claimData)
      stubOverpaymentResponse.returns(overpaymentResponse)
      stubUpdateClaimOverpaymentStatus.resolves()
      stubCheckUserAndLastUpdated.resolves()

      return supertest(app)
        .post('/claim/123/update-overpayment-status')
        .send(VALID_DATA_UPDATE_OVERPAYMENT_STATUS)
        .expect(302)
        .expect(function () {
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true
          expect(stubUpdateClaimOverpaymentStatus.calledWith(claimData.claim, overpaymentResponse)).to.be.true
        })
    })

    it('should respond with 400 when adding an overpayment and a validation error occurs', function () {
      var claimData = { claim: { IsOverpaid: false } }
      var overpaymentResponse = {}
      stubGetIndividualClaimDetails.resolves(claimData)
      stubOverpaymentResponse.returns(overpaymentResponse)
      stubCheckUserAndLastUpdated.resolves()
      stubUpdateClaimOverpaymentStatus.throws(new ValidationError())

      return supertest(app)
        .post('/claim/123/update-overpayment-status')
        .send(VALID_DATA_UPDATE_OVERPAYMENT_STATUS)
        .expect(400)
        .expect(function () {
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
          expect(stubUpdateClaimOverpaymentStatus.calledOnce).to.be.true
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
      stubCheckUserAndLastUpdated.throws(new ValidationError({ 'reason': {} }))

      return supertest(app)
        .post('/claim/123/payout-barcode-expired')
        .send(VALID_DATA_PAYOUT_BARCODE_EXPIRED_CLAIM)
        .expect(400)
        .expect(function () {
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
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
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true
          expect(stubPayoutBarcodeExpiredClaim.calledWith('123', 'Expiry reason')).to.be.true
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
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledOnce).to.be.true
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
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true
          expect(stubInsertNote.calledWith('123', 'This is a note')).to.be.true
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
      stubCheckUserAndLastUpdated.throws(new ValidationError({ 'reason': {} }))

      return supertest(app)
        .post('/claim/123/close-advance-claim')
        .send(VALID_DATA_CLOSE_ADVANCE_CLAIM)
        .expect(400)
        .expect(function () {
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
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
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true
          expect(stubCloseAdvanceClaim.calledWith('123', 'close advance claim reason')).to.be.true
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
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledOnce).to.be.true
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
      stubCheckUserAndLastUpdated.throws(new ValidationError({ 'reason': {} }))

      return supertest(app)
        .post('/claim/123/request-new-payment-details')
        .send(VALID_DATA_REQUEST_BANK_DETAILS)
        .expect(400)
        .expect(function () {
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
        })
    })

    it('should respond with 302 when request bank details submitted', function () {
      stubRequestNewBankDetails.resolves()
      stubCheckUserAndLastUpdated.resolves()
      stubGetIndividualClaimDetails.resolves({
        claim: {
          Reference: 'NEWBANK',
          EligibilityId: '1'
        }
      })

      return supertest(app)
        .post('/claim/123/request-new-payment-details')
        .send(VALID_DATA_REQUEST_BANK_DETAILS)
        .expect(302)
        .expect(function () {
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckUserAndLastUpdated.calledOnce).to.be.true
          expect(stubRequestNewBankDetails.calledWith('NEWBANK', '1', '123', '', 'test@test.com')).to.be.true
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
})
