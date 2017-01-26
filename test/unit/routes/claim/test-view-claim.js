const supertest = require('supertest')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const express = require('express')
const mockViewEngine = require('../mock-view-engine')
const sinon = require('sinon')
require('sinon-bluebird')

var authorisation
var stubGetIndividualClaimDetails
var stubSubmitClaimResponse
var stubClaimDecision
var stubGetClaimExpenseResponses
var stubGetClaimLastUpdated
var stubCheckLastUpdated
var stubInsertDeduction
var stubDisableDeduction
var stubClaimDeduction
var stubGetClaimDocumentFilePath
var stubUpdateClaimOverpaymentStatus
var stubOverpaymentResponse
var stubCloseAdvanceClaim
var stubMergeClaimExpensesWithSubmittedResponses
var stubRequestNewBankDetails
var stubUpdateEligibilityTrustedStatus
var ValidationError = require('../../../../app/services/errors/validation-error')
var deductionTypeEnum = require('../../../../app/constants/deduction-type-enum')
var bodyParser = require('body-parser')
const VALID_CLAIMEXPENSE_DATA = [{claimExpenseId: '1', approvedCost: '20.00', cost: '20.00', status: 'APPROVED'}]
const VALID_DATA_APPROVE = {
  'decision': 'APPROVED',
  'claimExpenses': VALID_CLAIMEXPENSE_DATA
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
const VALID_DATA_REQUEST_BANK_DETAILS = {
  'closed-claim-action': 'REQUEST-NEW-PAYMENT-DETAILS',
  'payment-details-additional-information': ''
}
const INCOMPLETE_DATA = {
  'decision': 'REJECTED',
  'reasonRejected': '',
  'claimExpense': []
}

describe('routes/claim/view-claim', function () {
  var app

  beforeEach(function () {
    authorisation = { isCaseworker: sinon.stub() }
    stubGetIndividualClaimDetails = sinon.stub()
    stubSubmitClaimResponse = sinon.stub()
    stubClaimDecision = sinon.stub()
    stubGetClaimExpenseResponses = sinon.stub()
    stubGetClaimLastUpdated = sinon.stub().resolves({})
    stubCheckLastUpdated = sinon.stub()
    stubInsertDeduction = sinon.stub()
    stubDisableDeduction = sinon.stub()
    stubClaimDeduction = sinon.stub()
    stubGetClaimDocumentFilePath = sinon.stub()
    stubUpdateClaimOverpaymentStatus = sinon.stub()
    stubOverpaymentResponse = sinon.stub()
    stubCloseAdvanceClaim = sinon.stub()
    stubMergeClaimExpensesWithSubmittedResponses = sinon.stub()
    stubRequestNewBankDetails = sinon.stub()
    stubUpdateEligibilityTrustedStatus = sinon.stub()

    var route = proxyquire('../../../../app/routes/claim/view-claim', {
      '../../services/authorisation': authorisation,
      '../../services/data/get-individual-claim-details': stubGetIndividualClaimDetails,
      '../../services/data/submit-claim-response': stubSubmitClaimResponse,
      '../../services/domain/claim-decision': stubClaimDecision,
      '../helpers/get-claim-expense-responses': stubGetClaimExpenseResponses,
      '../../services/data/get-claim-last-updated': stubGetClaimLastUpdated,
      '../../services/check-last-updated': stubCheckLastUpdated,
      '../../services/data/insert-deduction': stubInsertDeduction,
      '../../services/data/disable-deduction': stubDisableDeduction,
      '../../services/domain/claim-deduction': stubClaimDeduction,
      '../../services/data/get-claim-document-file-path': stubGetClaimDocumentFilePath,
      '../../services/data/update-claim-overpayment-status': stubUpdateClaimOverpaymentStatus,
      '../../services/domain/overpayment-response': stubOverpaymentResponse,
      '../../services/data/close-advance-claim': stubCloseAdvanceClaim,
      '../helpers/merge-claim-expenses-with-submitted-responses': stubMergeClaimExpensesWithSubmittedResponses,
      '../../services/data/request-new-bank-details': stubRequestNewBankDetails,
      '../../services/data/update-eligibility-trusted-status': stubUpdateEligibilityTrustedStatus
    })
    app = express()
    app.use(bodyParser.json())
    mockViewEngine(app, '../../../app/views')
    app.use(function (req, res, next) {
      req.user = {
        'email': 'test@test.com',
        'first_name': 'Andrew',
        'last_name': 'Adams',
        'roles': ['caseworker', 'admin', 'sscl']
      }
      req.session = {
        formData: {}
      }
      next()
    })
    route(app)
    app.use(function (req, res, next) {
      next(new Error())
    })
    app.use(function (err, req, res, next) {
      if (err) {
        res.status(500).render('includes/error')
      }
    })
  })

  describe('GET /claim/:claimId', function () {
    it('should respond with a 200', function () {
      stubGetIndividualClaimDetails.resolves({})

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
      stubCheckLastUpdated.returns(false)
      stubSubmitClaimResponse.resolves()
      stubClaimDecision.returns(newClaimDecision)
      stubGetClaimExpenseResponses.returns(newClaimExpenseResponse)

      return supertest(app)
        .post('/claim/123')
        .send(VALID_DATA_APPROVE)
        .expect(302)
        .expect(function () {
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckLastUpdated.calledOnce).to.be.true
          expect(stubGetClaimExpenseResponses.calledOnce).to.be.true
          expect(stubClaimDecision.calledOnce).to.be.true
          expect(stubSubmitClaimResponse.calledOnce).to.be.true
        })
    })

    it('should respond with a 500 for an unhandled exception', function () {
      stubCheckLastUpdated.returns(false)
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
      stubCheckLastUpdated.returns(false)
      stubSubmitClaimResponse.resolves()
      stubClaimDecision.returns(newClaimDecision)
      stubGetClaimExpenseResponses.returns(newClaimExpenseResponse)
      stubUpdateEligibilityTrustedStatus.resolves()

      return supertest(app)
        .post('/claim/123')
        .send(VALID_DATA_APPROVE)
        .expect(302)
        .expect(function () {
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckLastUpdated.calledOnce).to.be.true
          expect(stubGetClaimExpenseResponses.calledOnce).to.be.true
          expect(stubClaimDecision.calledOnce).to.be.true
          expect(stubSubmitClaimResponse.calledOnce).to.be.true
          expect(stubUpdateEligibilityTrustedStatus.calledOnce).to.be.true
        })
    })

    it('should respond with 400 when last updated check returns true', function () {
      stubCheckLastUpdated.returns(true)
      stubGetIndividualClaimDetails.resolves({})

      return supertest(app)
        .post('/claim/123')
        .send(VALID_DATA_APPROVE)
        .expect(400)
        .expect(function () {
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
        })
    })

    it('should respond with 400 when invalid data entered', function () {
      stubClaimDecision.throws(new ValidationError({ 'reason': {} }))
      stubGetIndividualClaimDetails.resolves({})
      stubCheckLastUpdated.returns(false)

      return supertest(app)
        .post('/claim/123')
        .send(INCOMPLETE_DATA)
        .expect(400)
        .expect(function () {
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
        })
    })

    it('should respond with a 500 when promise is rejected', function () {
      stubCheckLastUpdated.returns(false)
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

      stubCheckLastUpdated.returns(false)
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
    it('should respond with 400 when last updated check returns true', function () {
      stubCheckLastUpdated.returns(true)
      stubGetIndividualClaimDetails.resolves({})

      return supertest(app)
        .post('/claim/123/add-deduction')
        .send(VALID_DATA_ADD_DEDUCTION)
        .expect(400)
        .expect(function () {
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
        })
    })

    it('should respond with 400 including extra data if claim expenses exist and there is no update conflict when a validation error occurs', function () {
      var claimData = {
        claim: {},
        claimExpenses: {}
      }
      stubCheckLastUpdated.returns(false)
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
          expect(stubCheckLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
        })
    })

    it('should respond with 302 when valid data entered (add deduction)', function () {
      var testClaimDecisionObject = {deductionType: 'a', amount: '5'}
      stubCheckLastUpdated.returns(false)
      stubInsertDeduction.resolves({})
      stubClaimDeduction.returns(testClaimDecisionObject)

      return supertest(app)
        .post('/claim/123/add-deduction')
        .send(VALID_DATA_ADD_DEDUCTION)
        .expect(302)
        .expect(function () {
          expect(stubInsertDeduction.calledWith('123', testClaimDecisionObject)).to.be.true
        })
    })

    it('should respond with a 500 when promise is rejected', function () {
      stubCheckLastUpdated.returns(false)
      stubInsertDeduction.rejects()

      return supertest(app)
        .post('/claim/123/add-deduction')
        .send(VALID_DATA_ADD_DEDUCTION)
        .expect(500)
    })
  })

  describe('POST /claim/:claimId/remove-deduction', function () {
    it('should respond with 400 when last updated check returns true', function () {
      stubCheckLastUpdated.returns(true)
      stubGetIndividualClaimDetails.resolves({})

      return supertest(app)
        .post('/claim/123/remove-deduction')
        .send(VALID_DATA_ADD_DEDUCTION)
        .expect(400)
        .expect(function () {
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
        })
    })

    it('should respond with 302 when valid data entered (disable deduction)', function () {
      stubCheckLastUpdated.returns(false)
      stubDisableDeduction.resolves({})

      return supertest(app)
        .post('/claim/123/remove-deduction')
        .send(VALID_DATA_DISABLE_DEDUCTION)
        .expect(302)
        .expect(function () {
          expect(stubDisableDeduction.calledWith('1')).to.be.true
        })
    })

    it('should respond with a 500 when promise is rejected', function () {
      stubCheckLastUpdated.returns(false)
      stubDisableDeduction.rejects()

      return supertest(app)
        .post('/claim/123/remove-deduction')
        .send(VALID_DATA_DISABLE_DEDUCTION)
        .expect(500)
    })
  })

  describe('POST /claim/:claimId/update-overpayment-status', function () {
    it('should respond with 400 when last updated check returns true', function () {
      stubGetIndividualClaimDetails.resolves({})
      stubCheckLastUpdated.returns(true)

      return supertest(app)
        .post('/claim/123/update-overpayment-status')
        .send(VALID_DATA_UPDATE_OVERPAYMENT_STATUS)
        .expect(400)
        .expect(function () {
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
        })
    })

    it('should respond with 302 when valid data entered', function () {
      var claimData = { claim: { IsOverpaid: false } }
      var overpaymentResponse = {}
      stubGetIndividualClaimDetails.resolves(claimData)
      stubOverpaymentResponse.returns(overpaymentResponse)
      stubUpdateClaimOverpaymentStatus.resolves()
      stubCheckLastUpdated.returns(false)

      return supertest(app)
        .post('/claim/123/update-overpayment-status')
        .send(VALID_DATA_UPDATE_OVERPAYMENT_STATUS)
        .expect(302)
        .expect(function () {
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckLastUpdated.calledOnce).to.be.true
          expect(stubUpdateClaimOverpaymentStatus.calledWith(claimData.claim, overpaymentResponse)).to.be.true
        })
    })

    it('should respond with 400 when adding an overpayment and a validation error occurs', function () {
      var claimData = { claim: { IsOverpaid: false } }
      var overpaymentResponse = {}
      stubGetIndividualClaimDetails.resolves(claimData)
      stubOverpaymentResponse.returns(overpaymentResponse)
      stubCheckLastUpdated.returns(false)
      stubUpdateClaimOverpaymentStatus.throws(new ValidationError())

      return supertest(app)
        .post('/claim/123/update-overpayment-status')
        .send(VALID_DATA_UPDATE_OVERPAYMENT_STATUS)
        .expect(400)
        .expect(function () {
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
          expect(stubUpdateClaimOverpaymentStatus.calledOnce).to.be.true
        })
    })

    it('should respond with a 500 when promise is rejected', function () {
      stubCheckLastUpdated.returns(false)
      stubGetIndividualClaimDetails.resolves({})
      stubOverpaymentResponse.resolves({})
      stubUpdateClaimOverpaymentStatus.rejects()

      return supertest(app)
        .post('/claim/123/update-overpayment-status')
        .send(VALID_DATA_DISABLE_DEDUCTION)
        .expect(500)
    })
  })

  describe('POST /claim/:claimId/close-advance-claim', function () {
    it('should respond with 400 when last updated check returns true', function () {
      stubGetIndividualClaimDetails.resolves({})
      stubCheckLastUpdated.returns(true)

      return supertest(app)
        .post('/claim/123/close-advance-claim')
        .send(VALID_DATA_CLOSE_ADVANCE_CLAIM)
        .expect(400)
        .expect(function () {
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
        })
    })

    it('should respond with 302 when valid data entered', function () {
      stubCloseAdvanceClaim.resolves()
      stubCheckLastUpdated.returns(false)

      return supertest(app)
        .post('/claim/123/close-advance-claim')
        .send(VALID_DATA_CLOSE_ADVANCE_CLAIM)
        .expect(302)
        .expect(function () {
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckLastUpdated.calledOnce).to.be.true
          expect(stubCloseAdvanceClaim.calledWith('123', 'close advance claim reason')).to.be.true
        })
    })

    it('should respond with 400 when adding an overpayment and a validation error occurs', function () {
      stubCloseAdvanceClaim.throws(new ValidationError())
      stubGetIndividualClaimDetails.resolves({})
      stubCheckLastUpdated.returns(false)

      return supertest(app)
        .post('/claim/123/close-advance-claim')
        .send(VALID_DATA_CLOSE_ADVANCE_CLAIM)
        .expect(function () {
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledOnce).to.be.true
        })
    })

    it('should respond with a 500 when promise is rejected', function () {
      stubCloseAdvanceClaim.rejects()
      stubGetIndividualClaimDetails.resolves({})
      stubCheckLastUpdated.returns(false)

      return supertest(app)
        .post('/claim/123/close-advance-claim')
        .send(VALID_DATA_DISABLE_DEDUCTION)
        .expect(500)
    })
  })

  describe('POST /claim/:claimId/request-new-payment-details', function () {
    it('should respond with 400 when last updated check returns true', function () {
      stubGetIndividualClaimDetails.resolves({})
      stubCheckLastUpdated.returns(true)

      return supertest(app)
        .post('/claim/123/request-new-payment-details')
        .send(VALID_DATA_REQUEST_BANK_DETAILS)
        .expect(400)
        .expect(function () {
          expect(authorisation.isCaseworker.calledOnce).to.be.true
          expect(stubGetClaimLastUpdated.calledOnce).to.be.true
          expect(stubCheckLastUpdated.calledOnce).to.be.true
          expect(stubGetIndividualClaimDetails.calledWith('123')).to.be.true
        })
    })

    it('should respond with 302 when request bank details submitted', function () {
      stubRequestNewBankDetails.resolves()
      stubCheckLastUpdated.returns(false)
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
          expect(stubCheckLastUpdated.calledOnce).to.be.true
          expect(stubRequestNewBankDetails.calledWith('NEWBANK', '1', '123', '', 'test@test.com')).to.be.true
        })
    })

    it('should respond with a 500 when promise is rejected', function () {
      stubCloseAdvanceClaim.rejects()
      stubGetIndividualClaimDetails.resolves({})
      stubCheckLastUpdated.returns(false)

      return supertest(app)
        .post('/claim/123/request-new-payment-details')
        .send(VALID_DATA_DISABLE_DEDUCTION)
        .expect(500)
    })
  })
})
